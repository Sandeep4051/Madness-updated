/*
 * Thank-you note engine + UI for Madness thickshakes.
 *
 * generateNote() is a pure function with no DOM access, so the same
 * wording can be reused later from a native app or a backend.
 */

var MadnessNotes = (function () {

    /* ---------------- flavour library ---------------- */
    /* label = shown on the chip, text = how it reads inside a sentence */

    var FLAVOURS = [
        {
            id: 'chocolate', label: 'Chocolate', text: 'chocolate', emoji: '🍫',
            quips: [
                'Some days need a plan. Other days just need chocolate, and you picked right.',
                'Chocolate is the only problem that gets solved by making it disappear.',
                'The bitter bits of life go down easier with this much cocoa on top.',
                'Nobody has ever regretted chocolate. That record stays unbeaten today.'
            ]
        },
        {
            id: 'butterscotch', label: 'Butterscotch', text: 'butterscotch', emoji: '🍯',
            quips: [
                'Butterscotch is what grown-ups order when they miss being seven. No judgement here.',
                'Sweet, slightly burnt, still lovely. Butterscotch is basically a Monday done right.',
                'Every crunchy bit at the bottom is a small reward for surviving the week.',
                'It tastes like a childhood memory that somehow got better with age.'
            ]
        },
        {
            id: 'mango', label: 'Mango', text: 'mango', emoji: '🥭',
            quips: [
                'Mango season comes once a year. Lucky for you, our blender never got that memo.',
                'You ordered summer in a glass. Bold move, excellent taste.',
                'Life is short and mangoes are shorter, so this was the correct decision.',
                'Sunshine, but drinkable, and with far less sweating involved.'
            ]
        },
        {
            id: 'nutella', label: 'Nutella', text: 'nutella', emoji: '🍫',
            quips: [
                'Nutella in a glass, because eating it straight from the jar attracts questions.',
                'We would say share it, but we have met Nutella. Keep the straw to yourself.',
                'Some people keep a diary. You have this instead, and honestly it works faster.',
                'Everything hard about today just got outvoted by hazelnuts.'
            ]
        },
        {
            id: 'vanilla', label: 'Vanilla', text: 'vanilla', emoji: '🍦',
            quips: [
                'Vanilla gets called boring by people who never had it done properly. You know better.',
                'Plain on paper, perfect in practice. Vanilla is the friend who always shows up.',
                'Not every good thing has to shout about it. This glass proves the point.',
                'Simple things age well, and vanilla has been winning quietly for centuries.'
            ]
        },
        {
            id: 'banana', label: 'Banana', text: 'banana', emoji: '🍌',
            quips: [
                'Banana shake: the only way a fruit ever felt like dessert and got away with it.',
                'Potassium, but make it fun. Your trainer cannot even be upset about this one.',
                'Slightly healthy, entirely delicious, and nobody needs to know the ratio.',
                'It counts as fruit. We will both keep telling ourselves that.'
            ]
        },
        {
            id: 'fruit-n-nut', label: 'Fruit n Nut', text: 'fruit and nut', emoji: '🥜',
            quips: [
                'Fruit and nuts in one glass is practically a salad that grew a personality.',
                'Healthy enough to mention at dinner, sweet enough that it is not really a lie.',
                'A bit of everything, exactly like a good week. The crunchy parts are the best bits.',
                'This is what balance tastes like when balance stops being boring.'
            ]
        },
        {
            id: 'blue-lemonade', label: 'Blue Lemonade Mojito', text: 'blue lemonade mojito', emoji: '💙',
            quips: [
                'Blue lemonade is proof that the best decisions rarely match your outfit.',
                'Loud, blue and completely without regrets. Much like a good weekend.',
                'When life hands you lemons, apparently the right move is to make them blue.',
                'It looks like a holiday and tastes like you already booked the tickets.'
            ]
        },
        {
            id: 'green-apple', label: 'Green Apple Mojito', text: 'green apple mojito', emoji: '🍏',
            quips: [
                'An apple a day, except this one fizzes and forgives you for skipping the gym.',
                'Tart, cold and a little cheeky. Green apple knows exactly what it is doing.',
                'Sour first, sweet after. Most good stories work the same way.',
                'The mint is there to make you feel responsible. It is not fooling anyone.'
            ]
        },
        {
            id: 'lychee', label: 'Lychee', text: 'lychee', emoji: '🥤',
            quips: [
                'Lychee is the plot twist of the fruit world, and you saw it coming.',
                'Delicate, floral and gone in ninety seconds. Beautiful things usually are.',
                'Quietly the most interesting thing on the menu, much like you at a party.',
                'Soft on the first sip, unforgettable by the last. Good taste runs in your family.'
            ]
        },
        {
            id: 'sundae', label: 'Sundae', text: 'sundae', emoji: '🍨',
            quips: [
                'A sundae on a weekday is a small rebellion, and we fully support it.',
                'Spoon in one hand, problems on hold. That is the correct order of operations.',
                'Sundaes do not fix anything, they just make the queue of things to fix look shorter.',
                'Layers on layers, exactly like your week, except this one ends in sprinkles.'
            ]
        },
        {
            id: 'other', label: 'Something Else', text: 'thickshake', emoji: '🥤',
            quips: [
                'Whatever you ordered, you ordered it with confidence, and that is half the flavour.',
                'Thick, cold and entirely undefeated. Some things do not need a category.',
                'Life gets loud. A good thickshake turns the volume down for a minute.',
                'The glass is temporary, the decision to order it was excellent.'
            ]
        }
    ];

    /* ---------------- occasions ---------------- */

    var OCCASIONS = [
        {
            id: 'birthday', label: 'Birthday', emoji: '🎂',
            lines: [
                'Happy birthday! May the year ahead be as loaded as this {flavour} glass.',
                'Birthdays and {flavour} both come with candles of a sort. Enjoy every bit of yours.'
            ]
        },
        {
            id: 'first-order', label: 'First Order', emoji: '👋',
            lines: [
                'First {flavour} with us, and there is honestly no going back now. Welcome in.',
                'Everyone remembers their first {flavour}. Ours starts the day you walked in.'
            ]
        },
        {
            id: 'regular', label: 'Regular', emoji: '🔁',
            lines: [
                'Another {flavour}, another day you kept our blender gainfully employed. Thank you.',
                'You order {flavour} the way other people have a personality trait, and we respect it.'
            ]
        },
        {
            id: 'group', label: 'Group Order', emoji: '👥',
            lines: [
                'That is a lot of {flavour} for one order. We assume you are the group favourite.',
                'Feeding a crowd {flavour} is real leadership. Take the credit, you earned it.'
            ]
        },
        {
            id: 'celebration', label: 'Celebration', emoji: '🎉',
            lines: [
                'Big wins deserve big glasses, and {flavour} happens to be exactly the right size.',
                'Congratulations! Hard work tastes better when it is served cold, like this {flavour}.'
            ]
        },
        {
            id: 'festival', label: 'Festival', emoji: '✨',
            lines: [
                'Festive days, {flavour} ways. Hope yours is loud, bright and a little too sweet.',
                'Sweets at home, {flavour} in hand. That is a festival done properly.'
            ]
        },
        {
            id: 'thanks-for-waiting', label: 'Sorry For The Wait', emoji: '⏳',
            lines: [
                'Thanks for waiting. Good {flavour} takes time, though that was pushing it even for us.',
                'You waited longer than you should have, so the {flavour} had to be better than usual.'
            ]
        }
    ];

    /* ---------------- openers, closers, personal lines ---------------- */

    var OPENERS = [
        'Thanks for the order, {name}. One {flavour} thickshake, made just for you.',
        'Hey {name}, that {flavour} was blended with slightly too much love.',
        '{name}, you and that {flavour} were clearly meant to meet.',
        'Thank you, {name}. Your {flavour} has officially left our counter.',
        '{name}, ordering {flavour} today was a genuinely good call.',
        'Cheers, {name}. That {flavour} is ours to make and yours to finish.'
    ];

    var CLOSERS = [
        'Come back hungry.',
        'See you at the next craving.',
        'Sip slow, smile wide.',
        'Your straw is already waiting for round two.',
        'Until the next glass.',
        'Stay thick, stay happy.'
    ];

    var PERSONAL_PREFIXES = ['P.S.', 'Also,', 'One more thing:', 'And hey,'];

    /* 'P.S. See you Sunday.' reads right, 'Also, See you Sunday.' does not,
       so only the sentence-ending prefixes get a capital after them. */
    function joinPersonal(prefix, touch) {
        if (/[.:!?]$/.test(prefix)) {
            touch = touch.charAt(0).toUpperCase() + touch.slice(1);
        }
        return prefix + ' ' + touch;
    }

    var SIGNATURE = '— Team Madness';

    /* ---------------- helpers ---------------- */

    function findFlavour(id) {
        for (var i = 0; i < FLAVOURS.length; i++) {
            if (FLAVOURS[i].id === id) { return FLAVOURS[i]; }
        }
        return null;
    }

    function findOccasion(id) {
        for (var i = 0; i < OCCASIONS.length; i++) {
            if (OCCASIONS[i].id === id) { return OCCASIONS[i]; }
        }
        return null;
    }

    /* Picks a random entry, avoiding the one used last time where possible,
       so two notes in a row never read the same. */
    var lastPicks = {};
    function pick(list, memoryKey) {
        if (!list || !list.length) { return ''; }
        if (list.length === 1) { return list[0]; }
        var choice;
        var guard = 0;
        do {
            choice = list[Math.floor(Math.random() * list.length)];
            guard++;
        } while (memoryKey && choice === lastPicks[memoryKey] && guard < 12);
        if (memoryKey) { lastPicks[memoryKey] = choice; }
        return choice;
    }

    function fill(template, values) {
        return template.replace(/\{(\w+)\}/g, function (match, key) {
            return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : match;
        });
    }

    function cleanName(name) {
        var trimmed = (name || '').replace(/\s+/g, ' ').trim();
        if (!trimmed) { return 'friend'; }
        if (trimmed.length > 24) { trimmed = trimmed.slice(0, 24).trim(); }
        return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    }

    function cleanTouch(touch) {
        var trimmed = (touch || '').replace(/\s+/g, ' ').trim();
        if (!trimmed) { return ''; }
        if (trimmed.length > 90) { trimmed = trimmed.slice(0, 90).trim(); }
        if (!/[.!?]$/.test(trimmed)) { trimmed += '.'; }
        return trimmed;
    }

    /*
     * order = { name, flavourId, occasionId (optional), personalTouch (optional) }
     * returns { lines: [..max 3..], signature, text }
     */
    function generateNote(order) {
        order = order || {};
        var flavour = findFlavour(order.flavourId) || findFlavour('other');
        var occasion = order.occasionId ? findOccasion(order.occasionId) : null;
        var values = { name: cleanName(order.name), flavour: flavour.text };

        var lines = [];

        /* line 1 - always names the customer and what they ordered */
        lines.push(fill(pick(OPENERS, 'opener'), values));

        /* line 2 - the occasion when there is one, otherwise the flavour joke */
        if (occasion) {
            lines.push(fill(pick(occasion.lines, 'occasion-' + occasion.id), values));
        } else {
            lines.push(fill(pick(flavour.quips, 'quip-' + flavour.id), values));
        }

        /* line 3 - the staff member's own line when given, otherwise a sign-off */
        var touch = cleanTouch(order.personalTouch);
        if (touch) {
            lines.push(joinPersonal(pick(PERSONAL_PREFIXES, 'prefix'), touch));
        } else {
            lines.push(pick(CLOSERS, 'closer'));
        }

        lines = lines.slice(0, 3);

        return {
            lines: lines,
            signature: SIGNATURE,
            text: lines.join('\n') + '\n' + SIGNATURE
        };
    }

    return {
        FLAVOURS: FLAVOURS,
        OCCASIONS: OCCASIONS,
        generateNote: generateNote
    };
})();
