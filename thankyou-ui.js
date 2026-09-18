/* UI wiring for the thank-you note page. Depends on thankyou.js (MadnessNotes). */

(function () {
    'use strict';

    var $ = function (id) { return document.getElementById(id); };

    var els = {
        form: $('ty-form'),
        name: $('ty-name'),
        flavours: $('ty-flavours'),
        occasionNo: $('ty-occasion-no'),
        occasionYes: $('ty-occasion-yes'),
        occasions: $('ty-occasions'),
        touch: $('ty-touch'),
        counter: $('ty-counter'),
        error: $('ty-error'),
        result: $('ty-result'),
        noteTag: $('ty-note-tag'),
        noteBody: $('ty-note-body'),
        noteSign: $('ty-note-sign'),
        copy: $('ty-copy'),
        again: $('ty-again'),
        toast: $('ty-toast'),
        copyHelper: $('ty-copy-helper'),
        menuBtn: $('menu-btn'),
        nav: document.querySelector('.nav')
    };

    var state = {
        flavourId: null,
        occasionId: null,
        hasOccasion: false,
        note: null
    };

    /* ---------------- chips ---------------- */

    function buildChip(item, onPick) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'ty-chip';
        chip.setAttribute('aria-pressed', 'false');
        chip.dataset.id = item.id;

        var emoji = document.createElement('span');
        emoji.className = 'ty-emoji';
        emoji.setAttribute('aria-hidden', 'true');
        emoji.textContent = item.emoji;

        var label = document.createElement('span');
        label.textContent = item.label;

        chip.appendChild(emoji);
        chip.appendChild(label);
        chip.addEventListener('click', function () { onPick(item.id, chip); });
        return chip;
    }

    function selectWithin(container, chip) {
        var all = container.querySelectorAll('.ty-chip');
        for (var i = 0; i < all.length; i++) {
            all[i].setAttribute('aria-pressed', all[i] === chip ? 'true' : 'false');
        }
    }

    function renderChips() {
        MadnessNotes.FLAVOURS.forEach(function (flavour) {
            els.flavours.appendChild(buildChip(flavour, function (id, chip) {
                state.flavourId = id;
                selectWithin(els.flavours, chip);
                hideError();
            }));
        });

        MadnessNotes.OCCASIONS.forEach(function (occasion) {
            els.occasions.appendChild(buildChip(occasion, function (id, chip) {
                state.occasionId = id;
                selectWithin(els.occasions, chip);
                hideError();
            }));
        });
    }

    /* ---------------- occasion yes / no ---------------- */

    function setHasOccasion(hasOccasion) {
        state.hasOccasion = hasOccasion;
        els.occasionYes.setAttribute('aria-pressed', hasOccasion ? 'true' : 'false');
        els.occasionNo.setAttribute('aria-pressed', hasOccasion ? 'false' : 'true');
        els.occasions.hidden = !hasOccasion;
        if (!hasOccasion) {
            state.occasionId = null;
            selectWithin(els.occasions, null);
        }
        hideError();
    }

    /* ---------------- errors ---------------- */

    function showError(message) {
        els.error.textContent = message;
        els.error.hidden = false;
    }

    function hideError() {
        els.error.hidden = true;
    }

    /* ---------------- generating ---------------- */

    function currentOrder() {
        return {
            name: els.name.value,
            flavourId: state.flavourId,
            occasionId: state.hasOccasion ? state.occasionId : null,
            personalTouch: els.touch.value
        };
    }

    function generate(scrollToNote) {
        if (!state.flavourId) {
            showError('Pick the thickshake they ordered first, that is what the note is built from.');
            els.flavours.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        if (state.hasOccasion && !state.occasionId) {
            showError('Choose the occasion, or switch back to "No occasion".');
            els.occasions.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        hideError();
        state.note = MadnessNotes.generateNote(currentOrder());
        renderNote(state.note);

        if (scrollToNote) {
            els.result.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function renderNote(note) {
        /* textContent throughout, so whatever staff type stays plain text */
        els.noteBody.textContent = '';
        note.lines.forEach(function (line) {
            var p = document.createElement('p');
            p.textContent = line;
            els.noteBody.appendChild(p);
        });
        els.noteSign.textContent = note.signature;

        var name = (els.name.value || '').trim();
        els.noteTag.textContent = name ? 'Note for ' + name : 'Your note';

        els.result.hidden = false;
        resetCopyButton();
    }

    /* ---------------- copying ---------------- */

    function resetCopyButton() {
        els.copy.classList.remove('is-copied');
        els.copy.innerHTML = '<i class="fas fa-copy" aria-hidden="true"></i> Copy note';
    }

    function markCopied() {
        els.copy.classList.add('is-copied');
        els.copy.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Copied';
        showToast('Note copied, paste it wherever you like.');
        window.setTimeout(resetCopyButton, 2500);
    }

    function showToast(message) {
        els.toast.textContent = message;
        els.toast.classList.add('is-visible');
        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(function () {
            els.toast.classList.remove('is-visible');
        }, 2500);
    }

    /* Older iOS Safari and any page served over plain http have no
       navigator.clipboard, so fall back to a selected textarea. */
    function legacyCopy(text) {
        var helper = els.copyHelper;
        helper.value = text;
        helper.removeAttribute('readonly');

        var range = document.createRange();
        range.selectNodeContents(helper);
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        helper.setSelectionRange(0, text.length);

        var ok = false;
        try {
            ok = document.execCommand('copy');
        } catch (err) {
            ok = false;
        }

        helper.setAttribute('readonly', 'readonly');
        selection.removeAllRanges();
        return ok;
    }

    function copyNote() {
        if (!state.note) { return; }
        var text = state.note.text;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(markCopied, function () {
                if (legacyCopy(text)) {
                    markCopied();
                } else {
                    showToast('Copy blocked by the browser. Press and hold the note to select it.');
                }
            });
            return;
        }

        if (legacyCopy(text)) {
            markCopied();
        } else {
            showToast('Copy blocked by the browser. Press and hold the note to select it.');
        }
    }

    /* ---------------- events ---------------- */

    function bind() {
        els.form.addEventListener('submit', function (event) {
            event.preventDefault();
            /* closes the on-screen keyboard on phones before scrolling */
            if (document.activeElement && document.activeElement.blur) {
                document.activeElement.blur();
            }
            generate(true);
        });

        els.occasionYes.addEventListener('click', function () { setHasOccasion(true); });
        els.occasionNo.addEventListener('click', function () { setHasOccasion(false); });

        els.again.addEventListener('click', function () { generate(false); });
        els.copy.addEventListener('click', copyNote);

        els.touch.addEventListener('input', function () {
            var used = els.touch.value.length;
            els.counter.textContent = used + ' / 90';
            els.counter.classList.toggle('is-max', used >= 90);
        });

        /* pressing done on the name field should not submit a half-filled form */
        els.name.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                els.name.blur();
            }
        });

        if (els.menuBtn && els.nav) {
            els.menuBtn.addEventListener('click', function () {
                els.nav.classList.toggle('active');
            });
        }
    }

    renderChips();
    bind();
})();
