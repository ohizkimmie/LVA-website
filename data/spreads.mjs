

// ── SPREADS ──────────────────────────────
const SPREADS = [
  // ── FREE ─────────────────────────────────
  {id:'daily', name:'One-Card Daily Draw', count:1, level:'Beginner', tier:'free', cat:'Daily', sym:'◉',
   desc:'A simple one-card pull to tune into the energy or theme of the day. Perfect for building a daily practice and getting familiar with individual card meanings.',
   positions:[{name:'Daily Energy',desc:'The theme or energy available to you today'}]},
  {id:'ppp', name:'Past · Present · Future', count:3, level:'Beginner', tier:'free', cat:'General', sym:'◇',
   desc:'A classic three-card spread that gives a bird\'s-eye view of a situation — where you\'ve been, where you are, and where things are heading.',
   positions:[{name:'The Past',desc:'Recent influences shaping the situation'},{name:'The Present',desc:'Where things stand right now'},{name:'The Future',desc:'Where things are likely heading'}]},
  {id:'sao', name:'Situation · Action · Outcome', count:3, level:'Beginner', tier:'free', cat:'Decision-Making', sym:'◈',
   desc:'Practical guidance for a specific situation. Great for decisions that need clarity on the current dynamic, what action to take, and what result to expect.',
   positions:[{name:'The Situation',desc:'The current dynamic at play'},{name:'Recommended Action',desc:'What action would serve you best'},{name:'Likely Outcome',desc:'What results from taking that action'}]},
  {id:'yesno', name:'Yes · No', count:1, level:'Beginner', tier:'free', cat:'Quick Answer', sym:'✦',
   desc:'A one-card pull for a direct question. Upright = Yes. Reversed = No. The real insight is your gut reaction to the result — relief or disappointment reveals your true desire. Not recommended for complex questions.',
   positions:[{name:'Answer',desc:'Upright = Yes · Reversed = No · plus the energy behind the answer'}]},
  {id:'lovetrio', name:'Three-Card Love Spread', count:3, level:'Beginner', tier:'free', cat:'Love', sym:'♡',
   desc:'A quick, honest check-in on your love life — wherever you are in it. Whether you\'re in a relationship, newly dating, or very much single, this spread meets you exactly where you are.',
   positions:[{name:'Your Energy in Love Right Now',desc:'What you\'re bringing to your romantic life'},{name:'What\'s Present',desc:'The current energy of the relationship or romantic situation'},{name:'What\'s Needed',desc:'What would move things in the right direction'}]},
  {id:'weekly', name:'Weekly Preview Spread', count:7, level:'Beginner', tier:'free', cat:'Daily', sym:'◎',
   desc:'Seven cards for the seven days ahead. Pull any day of the week — the cards map to the next seven days starting from today. Not a prediction — more like a weather forecast for your week.',
   positions:[{name:'Day 1',desc:'Today\'s energy, where the week begins'},{name:'Day 2',desc:'What\'s building'},{name:'Day 3',desc:'Midpoint energy'},{name:'Day 4',desc:'What\'s gathering momentum'},{name:'Day 5',desc:'How the week closes'},{name:'Day 6',desc:'Rest, reflection, or release'},{name:'Day 7',desc:'Preparation for what\'s next'}]},
  // ── PREMIUM ──────────────────────────────
  {id:'celtic', name:'Celtic Cross', count:10, level:'Intermediate', tier:'premium', cat:'General', sym:'✦',
   desc:'The most well-known tarot spread. A comprehensive deep dive into any situation — covers the present, challenges, past influences, future possibilities, internal and external dynamics, and the likely outcome. No fixed fate — this is a roadmap, not a verdict.',
   positions:[
     {name:'Present / Self',desc:'Where you are right now — your current energy and circumstances'},
     {name:'The Challenge',desc:'What crosses you — the obstacle or complicating factor'},
     {name:'The Past',desc:'Recent events or influences that shaped the current situation'},
     {name:'The Future',desc:'What is coming in the near term'},
     {name:'Conscious',desc:'What you are aware of, hoping for, or focused on'},
     {name:'Unconscious',desc:'What is operating beneath the surface, often unseen'},
     {name:'Your Influence',desc:'How you are showing up — your attitude and approach'},
     {name:'External Influence',desc:'Outside forces, other people, or circumstances affecting the situation'},
     {name:'Hopes & Fears',desc:'The thing you most want — and most dread — about this situation'},
     {name:'Outcome',desc:'The likely destination if current energies continue — a summary of all'}
   ]},
  {id:'newmoon', name:'New Moon Spread', count:5, level:'Beginner', tier:'free', cat:'Moon', sym:'🌑',
   desc:'Designed for the New Moon — a time for planting seeds and setting intentions. Surfaces automatically when the New Moon is active via the moon phase API.',
   positions:[
     {name:'Where You Are Now',desc:'Your current state and starting point'},
     {name:'Energy Behind Your Intention',desc:'The deeper why beneath the manifestation'},
     {name:'Your Intention',desc:'The seed — what you are planting this cycle'},
     {name:'How to Nurture It',desc:'The action or energy that will help it grow'},
     {name:'What\'s Coming',desc:'What begins to emerge as this intention takes root'}
   ]},
  {id:'fullmoon', name:'Full Moon Spread', count:5, level:'Beginner', tier:'free', cat:'Moon', sym:'🌕',
   desc:'Designed for the Full Moon — a time for illumination, celebration, and release. Surfaces automatically when the Full Moon is active.',
   positions:[
     {name:'What\'s Being Illuminated',desc:'What the full moon is shining a light on in your life'},
     {name:'What to Celebrate',desc:'What you\'ve grown or accomplished since the new moon'},
     {name:'What to Release',desc:'What is ready to be let go of'},
     {name:'Why You\'re Holding On',desc:'The root of your resistance to releasing it'},
     {name:'What Opens Up',desc:'What becomes possible once you let go'}
   ]},
  {id:'waxingcrescent', name:'Waxing Crescent Spread', count:4, level:'Beginner', tier:'premium', cat:'Moon', sym:'🌒',
   desc:'The seed has been planted — now it needs tending. This spread helps you nurture the intention you set at the New Moon and identify what supports or blocks its growth.',
   positions:[
     {name:'The Seed',desc:'The intention asking to be planted'},
     {name:'The Soil',desc:'What supports this intention right now'},
     {name:'The Light',desc:'What will help it grow'},
     {name:'The Shadow',desc:'What could block it'}
   ]},
  {id:'firstquarter', name:'First Quarter Spread', count:5, level:'Beginner', tier:'premium', cat:'Moon', sym:'🌓',
   desc:'The moon is building and so are you. Friction is normal — it means you\'re actually moving. This spread helps you face what\'s blocking you and take the next decisive step.',
   positions:[
     {name:'The Challenge',desc:'What\'s blocking forward movement'},
     {name:'The Decision',desc:'The choice that must be made'},
     {name:'The Action',desc:'The step to take right now'},
     {name:'The Cost',desc:'What must be released to move forward'},
     {name:'The Reward',desc:'What\'s gained by pushing through'}
   ]},
  {id:'waxinggibbous', name:'Waxing Gibbous Spread', count:6, level:'Intermediate', tier:'premium', cat:'Moon', sym:'🌔',
   desc:'Almost there. This phase is about refinement, not overhaul. Trust the process, identify what still needs adjusting, and prepare yourself for the fullness that\'s coming.',
   positions:[
     {name:'The Progress',desc:'How far you\'ve already come'},
     {name:'The Gap',desc:'What\'s still missing or incomplete'},
     {name:'The Adjustment',desc:'What needs to be refined or corrected'},
     {name:'The Doubt',desc:'The fear or impatience to release'},
     {name:'The Trust',desc:'What to have faith in right now'},
     {name:'The Preparation',desc:'How to ready yourself for the full moon'}
   ]},
  {id:'waninggibbous', name:'Waning Gibbous Spread', count:6, level:'Intermediate', tier:'premium', cat:'Moon', sym:'🌖',
   desc:'The peak has passed and the light is slowly returning inward. This is the phase of integration and generosity — you\'ve received something. Now what do you do with it?',
   positions:[
     {name:'The Harvest',desc:'What you\'ve received or achieved this cycle'},
     {name:'The Gift',desc:'The wisdom you now carry'},
     {name:'The Offering',desc:'Who or what needs what you have'},
     {name:'The Gratitude',desc:'What to honor and acknowledge'},
     {name:'The Integration',desc:'How to carry this forward into the wane'},
     {name:'The Release',desc:'What to finally let go before the wane'}
   ]},
  {id:'thirdquarter', name:'Third Quarter Spread', count:5, level:'Beginner', tier:'premium', cat:'Moon', sym:'🌗',
   desc:'The light is receding and it\'s time to let things go. Not everything belongs in the next cycle. This spread helps you release what\'s finished and forgive what\'s heavy.',
   positions:[
     {name:'What to Release',desc:'What\'s no longer serving you'},
     {name:'The Root',desc:'Why you\'ve been holding on'},
     {name:'The Forgiveness',desc:'What or who needs to be forgiven — including yourself'},
     {name:'The Space',desc:'What becomes possible when you let go'},
     {name:'The Renewal',desc:'What is ready to grow in its place'}
   ]},
  {id:'waningcrescent', name:'Waning Crescent Spread', count:4, level:'Beginner', tier:'premium', cat:'Moon', sym:'🌘',
   desc:'The cycle is almost complete. This is the most introspective phase — rest, reflect, and begin dreaming toward your next intention. The dark is not empty; it\'s full of seeds.',
   positions:[
     {name:'The Lesson',desc:'What this lunar cycle taught you'},
     {name:'The Rest',desc:'What needs to be put down'},
     {name:'The Dream',desc:'What\'s quietly calling you toward the next cycle'},
     {name:'The Surrender',desc:'What to trust as you wait in the dark'}
   ]},
  {id:'horseshoe', name:'Horseshoe Spread', count:7, level:'Intermediate', tier:'premium', cat:'General', sym:'⊂',
   desc:'Cards laid in a fan/rainbow arc. Card 4 sits at the base center and is read first. Best for specific questions needing more depth than 3 cards but less than the Celtic Cross.',
   positions:[
     {name:'The Past',desc:'Past influences affecting the situation'},
     {name:'The Present',desc:'Current circumstances and energies'},
     {name:'Hidden Influences',desc:'What is operating beneath the surface'},
     {name:'You / Your Attitude',desc:'Center position — how you are approaching this (read first)'},
     {name:'External Influences',desc:'Outside forces at play'},
     {name:'What to Do',desc:'The advised action or approach'},
     {name:'Likely Outcome',desc:'Where things are heading if you follow the advice'}
   ]},
  {id:'astro', name:'Astrological Spread', count:12, level:'Advanced', tier:'premium', cat:'General', sym:'⊕',
   desc:'12 cards in a circle, counterclockwise from 9 o\'clock. Based on astrological houses — not zodiac signs. No zodiac knowledge required. Includes in-app House Reference Guide.',
   positions:[
     {name:'Identity',desc:'1st House — your self, appearance, and how you begin things'},
     {name:'Resources',desc:'2nd House — money, possessions, and what you value'},
     {name:'Communication',desc:'3rd House — thinking, speaking, siblings, short travel'},
     {name:'Home & Roots',desc:'4th House — home, family, emotional foundations'},
     {name:'Creativity & Joy',desc:'5th House — play, romance, children, creative expression'},
     {name:'Health & Daily Life',desc:'6th House — routines, health, work, service'},
     {name:'Relationships',desc:'7th House — partnerships, marriage, close one-on-one connections'},
     {name:'Transformation',desc:'8th House — shared resources, sex, death, rebirth'},
     {name:'Expansion',desc:'9th House — higher learning, travel, philosophy, beliefs'},
     {name:'Career & Legacy',desc:'10th House — public life, career, reputation, authority'},
     {name:'Community',desc:'11th House — friendships, groups, hopes, social causes'},
     {name:'The Unconscious',desc:'12th House — hidden matters, solitude, karma, spirituality'}
   ]},
  {id:'yearahead', name:'Year Ahead Spread', count:13, level:'Intermediate', tier:'premium', cat:'General', sym:'✦',
   desc:'Twelve cards in a clockwise circle — one per month starting from today — plus a 13th card at the center for the overall theme of the year. Pull any time of year, not just January.',
   positions:[
     {name:'Month 1',desc:'The energy of the current month'},{name:'Month 2',desc:''},{name:'Month 3',desc:''},
     {name:'Month 4',desc:''},{name:'Month 5',desc:''},{name:'Month 6',desc:''},
     {name:'Month 7',desc:''},{name:'Month 8',desc:''},{name:'Month 9',desc:''},
     {name:'Month 10',desc:''},{name:'Month 11',desc:''},{name:'Month 12',desc:'The energy of the final month'},
     {name:'Overall Theme',desc:'The central card — read last. The overarching energy of the full year ahead.'}
   ]},
  {id:'relationship', name:'Relationship Spread', count:7, level:'Intermediate', tier:'premium', cat:'Love', sym:'♡',
   desc:'A heart-shaped spread for exploring the dynamics between two people — romantic, platonic, or otherwise. Not a fortune telling spread. It\'s a mirror. It looks at both people honestly, what\'s connecting you, what\'s creating friction, and where things are heading.',
   positions:[
     {name:'You',desc:'Your energy and where you\'re coming from — center of the heart'},
     {name:'Them',desc:'Their energy and where they\'re coming from'},
     {name:'The Connection',desc:'What bonds you — the thread between you'},
     {name:'The Challenge',desc:'What creates friction or tension'},
     {name:'What You Bring',desc:'Your strengths and gifts in this relationship'},
     {name:'What They Bring',desc:'Their strengths and gifts'},
     {name:'Where This Is Heading',desc:'The likely direction if current energies continue'}
   ]},
  {id:'decision', name:'Decision Spread', count:7, level:'Intermediate', tier:'premium', cat:'Decision-Making', sym:'◇',
   desc:'When you\'re standing at a crossroads and need more than a coin flip. Two paths laid side by side so you can see them clearly — not to decide for you, but to illuminate what each choice actually holds.',
   positions:[
     {name:'The Situation',desc:'Where you are right now — the heart of the decision'},
     {name:'Option A',desc:'The energy of the first path'},
     {name:'Option B',desc:'The energy of the second path'},
     {name:'What to Consider',desc:'Something you may be overlooking'},
     {name:'What to Leave Behind',desc:'What needs releasing regardless of which path you choose'},
     {name:'Outcome A',desc:'Where the first path leads'},
     {name:'Outcome B',desc:'Where the second path leads'}
   ]},
  {id:'shadowwork', name:'Shadow Work Spread', count:6, level:'Intermediate', tier:'premium', cat:'Inner Work', sym:'◉',
   desc:'The shadow is the part of you that lives below the surface — the patterns, wounds, fears, and beliefs you\'ve tucked away because they felt too uncomfortable to look at. This spread doesn\'t judge what it finds. It just shines a light.',
   positions:[
     {name:'My Current Self',desc:'Who you are showing up as right now'},
     {name:'What I\'m Hiding',desc:'What you\'re not fully acknowledging, even to yourself'},
     {name:'The Root',desc:'Where this shadow pattern comes from'},
     {name:'How It\'s Affecting Me',desc:'The way this pattern is showing up in your life'},
     {name:'What It\'s Protecting Me From',desc:'The fear underneath the shadow'},
     {name:'The Path Forward',desc:'How to begin integrating this part of yourself'}
   ]},
  {id:'career', name:'Career & Purpose Spread', count:6, level:'Intermediate', tier:'premium', cat:'Career', sym:'✦',
   desc:'For when you\'re questioning your path, feeling stuck in your work, or trying to figure out what you\'re actually here to do. This spread doesn\'t just look at your job — it looks at your calling.',
   positions:[
     {name:'Where You Are Now',desc:'Your current energy around work and purpose'},
     {name:'Your Gifts',desc:'What you naturally bring that the world needs'},
     {name:'What\'s Blocking You',desc:'The obstacle standing between you and alignment'},
     {name:'What to Release',desc:'What you\'re holding onto that\'s keeping you stuck'},
     {name:'Your Next Step',desc:'The most aligned action available to you right now'},
     {name:'Your Purpose',desc:'The bigger picture of what you\'re being called toward'}
   ]},
  {id:'chakra', name:'Chakra Spread', count:7, level:'Intermediate', tier:'premium', cat:'Inner Work', sym:'◈',
   desc:'Seven cards, one for each chakra from root to crown. A snapshot of your entire energetic body — where energy is flowing freely and where it may be blocked, overactive, or in need of attention.',
   positions:[
     {name:'Root Chakra',desc:'Safety, security, and foundation'},
     {name:'Sacral Chakra',desc:'Creativity, pleasure, and emotion'},
     {name:'Solar Plexus Chakra',desc:'Confidence, personal power, and identity'},
     {name:'Heart Chakra',desc:'Love, compassion, and connection'},
     {name:'Throat Chakra',desc:'Communication, truth, and expression'},
     {name:'Third Eye Chakra',desc:'Intuition, clarity, and inner vision'},
     {name:'Crown Chakra',desc:'Spiritual connection, higher purpose, and consciousness'}
   ]}
];

export const SPREADS_TYPED = SPREADS;
export { SPREADS };
