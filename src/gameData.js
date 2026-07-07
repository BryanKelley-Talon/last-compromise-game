// ============================================================
// gameData.js — 1850: The Last Compromise  (STANDARD 11.3 · slug last-compromise-game)
//
// Protagonist: Lewis Hayden. Content filled VERBATIM from
// flashpoint-brief-11.3-last-compromise.docx (chapters, decisions, options,
// consequences, meter deltas, verdicts). Two fields per chapter are authored
// to the same realness rules the brief requires — `quote`/`quoteSource`
// (real, documented, public-domain epigraphs) and `hingeQuestion` (a
// Regents-style MC built from the chapter's decision).
//
// Accent is NOT the brief's raw #2C4A2E — it comes from the token file:
// accentFor("11.3") = #5AA57B (antebellum green). Source of truth is
// src/tokens/flashpoint-tokens.(css|js); never re-decide the accent here.
//
// Verdict logic: highest gauge at game end wins; tie → first verdict listed.
// (App.jsx getVerdict honors meta.verdictMode === 'highestGauge'.)
// ============================================================

// meters — gauge KEYS are the brief's exact keys; deltas below use them verbatim.
const init = {
  enforcement: 45,
  network:     25,
  conscience:  30,
  safety:      20,
}

// Meter bar colors are presentation only (not carried by the brief). Chosen
// distinct and legible on the #16120E canvas; the game accent stays #5AA57B.
const meterConfig = [
  { key: 'enforcement', label: 'Federal Enforcement', color: '#8B1A1A' },
  { key: 'network',     label: 'Vigilance Network',   color: '#3E7C4A' },
  { key: 'conscience',  label: 'Northern Conscience',  color: '#4A6FA5' },
  { key: 'safety',      label: 'Personal Safety',     color: '#C69A3E' },
]

// verdicts — keyed to the highest gauge at game end (brief §5). Order matters:
// a tie resolves to the FIRST verdict listed. subtitle = the winning gauge's
// label; color = that gauge's meter color. Descriptions are verbatim.
const verdicts = [
  {
    key: 'network',
    title: 'The Man of Action',
    subtitle: 'Vigilance Network',
    color: '#3E7C4A',
    description: `You built the machine that made Boston a fortress for the hunted: safe houses, rescues, a network marshals feared to cross. Hundreds reached freedom through your door. They'll call you reckless; the people you saved will call you the reason they lived.`,
  },
  {
    key: 'conscience',
    title: 'The Awakener',
    subtitle: 'Northern Conscience',
    color: '#4A6FA5',
    description: `You understood a rescue is also theater — that every courthouse you stormed and every coffin the city watched pass turned bystanders into abolitionists. You made the North ashamed of the law. The war of minds was won before the war of guns began.`,
  },
  {
    key: 'enforcement',
    title: 'The Reckoning',
    subtitle: 'Federal Enforcement',
    color: '#8B1A1A',
    description: `You forced the government to show its true face — chains on the courthouse, troops in the streets, forty thousand dollars to march one man to a ship — and made yourself its most wanted enemy. You hastened the collision the country spent forty years avoiding.`,
  },
  {
    key: 'safety',
    title: 'The Survivor',
    subtitle: 'Personal Safety',
    color: '#C69A3E',
    description: `You freed yourself, kept your family whole, and lived — through the raids, the indictments, the war — to sit in the legislature of the state that once would have returned you in chains. Some called it caution. A movement needs people who last, and you were still standing when the walls came down.`,
  },
]

const ACCENT = '#5AA57B' // accentFor("11.3") — antebellum green, from the token file

const chapters = [

  // ═══════════════════════════════════════════════════════
  // CHAPTER 1 — Sold South
  // ═══════════════════════════════════════════════════════
  {
    id: 1, title: 'Sold South', accentColor: ACCENT,
    roleId: 'hayden', subtitle: 'Lexington, Kentucky · ~1844',
    role: 'Lewis Hayden, ~32 — enslaved hotel porter; self-taught reader',
    years: '~1844',
    quote: `"All legislation, all government, all society is founded upon the principle of mutual concession, politeness, comity, courtesy; upon these, everything is based."`,
    quoteSource: 'Henry Clay, Senate speech on the Compromise, 1850',
    context: [
      `You are Lewis Hayden, and you have already lost one family. Years ago your first wife and small son were sold — passed through the hands of Senator Henry Clay, Kentucky's own "Great Compromiser" — and carried to the Deep South. You don't know if they're alive. That is what it means to be property: the men who broker the nation's compromises can sell your child between breakfast and dinner.`,
      `You taught yourself to read from a hidden Bible and smuggled newspapers, and you listen when Northerners pass through the hotel. You have a second wife now, Harriet, and her boy Joseph, and you've sworn not to lose these too. But there's no safe way to keep a family you don't own.`,
      `Two white strangers — a Vermont teacher, Delia Webster, and a young minister, Calvin Fairbank — say they can get you North. If they're caught, they go to prison. If you're caught, you're sold South, Harriet and Joseph with you.`,
    ],
    decisions: [
      {
        year: '~1844',
        situation: `Their route runs on other people's promises: safe houses you've never seen, a river crossing, strangers in Ohio.`,
        question: `When the only road to freedom is built by people who risk far less than you do, is trusting it courage — or the last thing a desperate man can do?`,
        options: [
          { label: 'A', text: `Trust the plan and run now, all three.`,
            consequence: `The only door open. You stake three lives on a plan built by people who can walk away from the danger.`,
            meters: { network: +6, safety: -8 } },
          { label: 'B', text: `Send Harriet and Joseph ahead; follow when it's proven.`,
            consequence: `Halves the risk to any one of you — and doubles the chance the system separates you again, the way it already did once.`,
            meters: { safety: +4, network: +2 } },
          { label: 'C', text: `Wait for a safer chance.`,
            consequence: `Caution has kept you alive this long. It's also kept you a slave.`,
            meters: { safety: +6, network: -6, enforcement: +4 } },
        ],
      },
      {
        year: '~1844',
        situation: `Fairbank's plan asks you to powder your face pale and pose as a white gentleman with a servant, Joseph hidden under the carriage seat.`,
        question: `To become free, Hayden had to impersonate the very people who enslaved him. What does it cost to save yourself by performing the thing the system says you can never be?`,
        options: [
          { label: 'A', text: `Commit to the disguise; play the master.`,
            consequence: `You wear the mask of the people who own you. It works because no patroller expects a slave to dare it.`,
            meters: { network: +6, safety: +4, enforcement: -4 } },
          { label: 'B', text: `Refuse the charade; travel hidden as cargo.`,
            consequence: `Easier on your dignity, harder on your life — hidden people get searched for.`,
            meters: { safety: -4, network: +2 } },
        ],
      },
    ],
    hingeQuestion: {
      question: `The sale of Lewis Hayden's first wife and child BEST illustrates which reality of slavery in the United States before the Civil War?`,
      options: [
        `Enslaved families were protected by law from being separated.`,
        `The domestic slave trade routinely broke apart enslaved families, who could be bought and sold as property.`,
        `Slavery existed only in the Deep South, not in border states such as Kentucky.`,
        `Enslaved people had a legal right to purchase their own family members.`,
      ],
      correctIndex: 1,
      explanation: `Under the law, enslaved people were property, and the domestic (internal) slave trade regularly sold family members away from one another — as happened to Hayden's first wife and son, sold through Henry Clay and carried to the Deep South. Border states like Kentucky were slave states and active participants in that trade. The permanent threat of sale and separation is essential context for understanding why freedom seekers risked everything to escape.`,
      regentsSkill: 'Historical Context',
    },
  },

  // ═══════════════════════════════════════════════════════
  // CHAPTER 2 — A Free Man's Debt
  // ═══════════════════════════════════════════════════════
  {
    id: 2, title: `A Free Man's Debt`, accentColor: ACCENT,
    roleId: 'hayden', subtitle: 'Boston · 1846–1849',
    role: 'Lewis Hayden, ~35 — opening a clothing store on Cambridge Street',
    years: '1846–1849',
    quote: `"Am I not a man and a brother?"`,
    quoteSource: 'Abolitionist motto, after Josiah Wedgwood, 1787',
    context: [
      `You made it. You and Harriet took the name Hayden and opened a store, and it does well — the first money that was ever yours. But freedom came with a bill. Calvin Fairbank, who drove your carriage north, was caught going back to Kentucky. He's serving fifteen years — five for each person he freed. He's in a cell because he got you out of one.`,
      `And by Kentucky law you're still, on paper, a fugitive. You've saved a little. Enough, perhaps, to buy your own legal freedom — or to help buy Fairbank out. Not both. Not yet.`,
    ],
    decisions: [
      {
        year: '1846–1849',
        situation: `$650, a fortune for a man three years out of slavery.`,
        question: `You owe the law nothing and your rescuer everything. When safety and the debt to the person who freed you pull opposite ways, which comes first?`,
        options: [
          { label: 'A', text: `Buy your own freedom first.`,
            consequence: `Secure the ground under your family before spending on anyone else. Prudent — and the man who saved you waits in a cell while you protect yourself.`,
            meters: { safety: +10, network: -2 } },
          { label: 'B', text: `Put it toward Fairbank.`,
            consequence: `You pay the debt of conscience before the debt of law, and remain, on paper, a fugitive anyone can claim.`,
            meters: { network: +8, conscience: +4, safety: -6 } },
          { label: 'C', text: `Split it.`,
            consequence: `You honor both and finish neither; both dangers stay open.`,
            meters: { network: +3, safety: +2 } },
        ],
      },
      {
        year: '1846–1849',
        situation: `The Vigilance Committee wants you: a self-emancipated man with a shop, a voice, and standing.`,
        question: `You clawed your way to a safe, prosperous life. Does owing that freedom to others obligate you to risk it for strangers — or have you already paid enough?`,
        options: [
          { label: 'A', text: `Step into leadership.`,
            consequence: `You turn your store into a station and your name into a banner. Fugitives will find your door; so will their hunters.`,
            meters: { network: +10, conscience: +3, safety: -6 } },
          { label: 'B', text: `Help quietly — money and shelter, no public role.`,
            consequence: `Real aid, low profile. The movement gains a patron, not a leader.`,
            meters: { network: +5, safety: +2 } },
          { label: 'C', text: `Keep to the business.`,
            consequence: `No one could blame a man three years free for wanting peace. The movement notes the empty chair.`,
            meters: { safety: +8, network: -6 } },
        ],
      },
    ],
    hingeQuestion: {
      question: `The Underground Railroad and safe houses such as Lewis Hayden's in Boston are BEST described as —`,
      options: [
        `an official program funded and operated by the federal government`,
        `a railroad company that transported goods between the free states`,
        `an informal network of activists — many of them free and formerly enslaved Black Americans — who helped freedom seekers escape slavery`,
        `a Southern effort to return escaped enslaved people to bondage`,
      ],
      correctIndex: 2,
      explanation: `The Underground Railroad was not a railroad and not a government program; it was a secret, informal network of abolitionists — a large share of them free and formerly enslaved Black Americans like Hayden — who sheltered and guided freedom seekers northward. Hayden's Boston store and home at 66 Phillips Street served as one of its stations. Understanding it as grassroots, illegal, and Black-led is key to the era's history of resistance.`,
      regentsSkill: 'Historical Context',
    },
  },

  // ═══════════════════════════════════════════════════════
  // CHAPTER 3 — The Law Comes North
  // ═══════════════════════════════════════════════════════
  {
    id: 3, title: 'The Law Comes North', accentColor: ACCENT,
    roleId: 'hayden', subtitle: 'Boston · 1850',
    role: 'Lewis Hayden — safe-house keeper at 66 Phillips St.',
    years: '1850',
    quote: `"This filthy enactment was made in the nineteenth century by people who could read and write. I will not obey it, by God."`,
    quoteSource: 'Ralph Waldo Emerson, journal, on the Fugitive Slave Law, 1851',
    context: [
      `In September 1850, Congress passes the Fugitive Slave Act — the keystone of Clay's Compromise — and it reaches all the way to Boston. Any marshal can now seize a Black person on a slave-catcher's say-so: no trial, no jury, no testimony from the accused. Feeding or hiding a fugitive is a federal crime. The law conscripts every Northerner into slavery's service.`,
      `Within weeks, Ellen and William Craft — who escaped Georgia by the same disguise that freed you — arrive with catchers on their trail. The men hunting them are standing in your street.`,
    ],
    decisions: [
      {
        year: '1850',
        situation: `The catchers have warrants. The Crafts are in your house.`,
        question: `A law only dies when someone defies it in the open. Which does more — the quiet rescue, or the public dare?`,
        options: [
          { label: 'A', text: `Take them in openly, and let it be known.`,
            consequence: `You plant a flag. Every fugitive in New England learns your door is open; so does every marshal.`,
            meters: { network: +12, conscience: +5, safety: -8, enforcement: +4 } },
          { label: 'B', text: `Hide them briefly and speed them out of the country.`,
            consequence: `Get the Crafts to England fast and quiet; help without becoming the symbol.`,
            meters: { network: +6, safety: -2 } },
        ],
      },
      {
        year: '1850',
        situation: `The catchers come to your barricaded door. In the cellar sit kegs of gunpowder, and you can tell the men on your step — believably — that you'll blow the house with everyone in it before you surrender a soul inside.`,
        question: `Is a threat of violence you're prepared to keep an act of protection — or does meeting the law with a bomb make you into something the law can finally condemn?`,
        options: [
          { label: 'A', text: `Make the threat, and mean it.`,
            consequence: `They read your face, decide you're not bluffing, and leave. No shot, no law obeyed — resistance by the credible promise of catastrophe.`,
            meters: { network: +10, conscience: +4, enforcement: +6, safety: -4 } },
          { label: 'B', text: `Hold the door with barricades and lawyers only.`,
            consequence: `Defensible in court, less certain to work. You bet on delay and the Committee's attorneys.`,
            meters: { network: +4, conscience: +2, safety: +2 } },
        ],
      },
    ],
    hingeQuestion: {
      question: `The Fugitive Slave Act of 1850 intensified sectional conflict PRIMARILY because it —`,
      options: [
        `abolished slavery in the western territories`,
        `required citizens and officials in the free states to help capture escaped enslaved people and denied the accused a trial by jury`,
        `granted immediate citizenship to all formerly enslaved people`,
        `ended the domestic slave trade in Washington, D.C.`,
      ],
      correctIndex: 1,
      explanation: `The Fugitive Slave Act, part of the Compromise of 1850, forced Northerners to assist in capturing freedom seekers and stripped the accused of a jury trial and the right to testify. By reaching into free states and conscripting ordinary citizens into slavery's enforcement, it inflamed Northern opinion and made the distant institution of slavery a local, personal crisis — a major cause of deepening sectional division.`,
      regentsSkill: 'Causation',
    },
  },

  // ═══════════════════════════════════════════════════════
  // CHAPTER 4 — The Courthouse
  // ═══════════════════════════════════════════════════════
  {
    id: 4, title: 'The Courthouse', accentColor: ACCENT,
    roleId: 'hayden', subtitle: 'Boston · February 1851',
    role: 'Lewis Hayden — Vigilance Committee executive',
    years: 'February 1851',
    quote: `"There is a higher law than the Constitution."`,
    quoteSource: 'William H. Seward, U.S. Senate, 1850',
    context: [
      `Marshals seize Shadrach Minkins, a waiter who escaped Virginia, and hold him in the courthouse to ship South. The lawyers file motions; everyone knows how that ends. You have about twenty men who'll follow you through the doors and take Minkins by force, in daylight, from federal custody.`,
      `It's never been done. Succeed, and you humiliate the Fugitive Slave Act before the whole country. Fail, and you hang. The committee splits the way it always does — the white members counsel patience; the Black members, whose freedom is actually on the table, are ready to move.`,
    ],
    decisions: [
      {
        year: 'February 1851',
        situation: `The lawyers ask for time. The marshals have Minkins now.`,
        question: `When caution is counseled by the safe and urgency demanded by the endangered, whose judgment should rule?`,
        options: [
          { label: 'A', text: `Storm the courthouse.`,
            consequence: `You lead twenty men through the doors and carry Minkins into the street before the marshals react. It works. The country reels.`,
            meters: { network: +12, conscience: +8, enforcement: +10, safety: -8 } },
          { label: 'B', text: `Give the lawyers their day.`,
            consequence: `Respect the process the movement claims to defend. If it fails, you've lost Minkins to prove a point about method.`,
            meters: { network: -4, enforcement: +2, safety: +4 } },
        ],
      },
      {
        year: 'February 1851',
        situation: `Minkins is out, hunted, in your city.`,
        question: `You did the dangerous part. Do you also carry the risk of the aftermath — or is knowing when to step back its own kind of wisdom?`,
        options: [
          { label: 'A', text: `Hide him yourself; run him to Montreal.`,
            consequence: `He reaches Canada free. You'll stand trial — and a Boston jury, unwilling to convict, deadlocks and sets you loose.`,
            meters: { network: +8, conscience: +4, safety: -8 } },
          { label: 'B', text: `Hand him to trusted others.`,
            consequence: `The job still gets done; your exposure drops. Risk shared is leadership shared.`,
            meters: { network: +4, safety: +2 } },
        ],
      },
    ],
    hingeQuestion: {
      question: `The rescue of Shadrach Minkins and similar acts of resistance to the Fugitive Slave Act BEST demonstrate —`,
      options: [
        `that Northerners uniformly supported the enforcement of federal slave laws`,
        `that many Northerners were willing to defy a federal law they judged to be unjust`,
        `that the Supreme Court had already declared the Fugitive Slave Act unconstitutional`,
        `that resistance to the law was limited to elected officials`,
      ],
      correctIndex: 1,
      explanation: `When Hayden and other members of the Boston Vigilance Committee seized Shadrach Minkins from federal custody, they were openly breaking federal law because they judged it unjust. Such rescues — a form of civil disobedience and, at times, forcible resistance — show a growing Northern willingness to defy the Fugitive Slave Act. Resistance came largely from ordinary citizens and activists, not from the courts, which had upheld the law.`,
      regentsSkill: 'Argumentation',
    },
  },

  // ═══════════════════════════════════════════════════════
  // CHAPTER 5 — The Law Wins
  // ═══════════════════════════════════════════════════════
  {
    id: 5, title: 'The Law Wins', accentColor: ACCENT,
    roleId: 'hayden', subtitle: 'Boston · April 1851',
    role: 'Lewis Hayden — marked man',
    years: 'April 1851',
    quote: `"I am in earnest — I will not equivocate — I will not excuse — I will not retreat a single inch — AND I WILL BE HEARD."`,
    quoteSource: 'William Lloyd Garrison, The Liberator, 1831',
    context: [
      `Weeks later the state answers. When marshals seize Thomas Sims — seventeen, escaped from Georgia — the courthouse is wrapped in heavy chains and ringed by hundreds of guards; the judges duck under the chains to enter, the law itself bowing to hold a boy.`,
      `At dawn, armed men march Sims to a ship at Long Wharf and send him back to Georgia, where he is publicly whipped. Boston, cradle of the Revolution, has returned a child to slavery under federal guns. This is what the Compromise looks like when it holds.`,
    ],
    decisions: [
      {
        year: 'April 1851',
        situation: `Some want to rush the chained courthouse anyway. It would be slaughter.`,
        question: `When a fight cannot be won, is refusing to fight cowardice — or the only way to still be standing for the fight that can?`,
        options: [
          { label: 'A', text: `Attempt it anyway.`,
            consequence: `A doomed charge that would spend lives to make a point. Courage, or waste?`,
            meters: { conscience: +6, enforcement: +8, network: -4, safety: -10 } },
          { label: 'B', text: `Stand down; preserve the network for a fight you can win.`,
            consequence: `The hardest discipline — swallow the fury, keep your people alive for next time. Sims goes South.`,
            meters: { network: +6, conscience: -2, safety: +2 } },
        ],
      },
      {
        year: 'April 1851',
        situation: `The fury has to go somewhere. You can aim it.`,
        question: `Do you build a movement strong enough to fight the law — or one large enough to change the minds of the people who let it pass?`,
        options: [
          { label: 'A', text: `Call for armed resistance.`,
            consequence: `You harden the movement's core and frighten the moderate middle you might have won.`,
            meters: { network: +8, enforcement: +6, conscience: -2 } },
          { label: 'B', text: `Weaponize the shame — make moderates watch what complicity costs a child.`,
            consequence: `Slower, but it turns bystanders into abolitionists. Sims becomes a wound the North won't stop touching.`,
            meters: { conscience: +12, network: +2 } },
        ],
      },
    ],
    hingeQuestion: {
      question: `The return of Thomas Sims to slavery under heavy federal guard in Boston most directly contributed to —`,
      options: [
        `a sharp decline in antislavery feeling across the North`,
        `the repeal of the Fugitive Slave Act by Congress`,
        `growing Northern opposition to slavery by dramatizing the human cost of enforcing the Fugitive Slave Act`,
        `the immediate outbreak of the Civil War`,
      ],
      correctIndex: 2,
      explanation: `The spectacle of Boston — the "cradle of the Revolution" — marching a seventeen-year-old back to slavery under chains and federal guns turned a legal proceeding into a public shaming of the law. Rather than quiet antislavery feeling, such renditions dramatized slavery's reach into the free states and pushed more Northerners toward the antislavery cause. It neither repealed the law nor started the war, but it deepened sectional hostility.`,
      regentsSkill: 'Causation',
    },
  },

  // ═══════════════════════════════════════════════════════
  // CHAPTER 6 — Anthony Burns
  // ═══════════════════════════════════════════════════════
  {
    id: 6, title: 'Anthony Burns', accentColor: ACCENT,
    roleId: 'hayden', subtitle: 'Boston · 1854',
    role: 'Lewis Hayden — veteran of the courthouse wars',
    years: '1854',
    quote: `"We went to bed one night old-fashioned, conservative, compromise Union Whigs and waked up stark mad Abolitionists."`,
    quoteSource: 'Amos A. Lawrence, on the return of Anthony Burns, 1854',
    context: [
      `It happens again, bigger. Anthony Burns, escaped from Virginia, is held in the courthouse — but now the whole North is watching, and the Kansas-Nebraska Act has just shredded the old compromise line. A plan forms to storm the courthouse and free Burns by force. You've led this before. But the building is defended, and in the chaos a deputy marshal, James Batchelder, is killed. The rescue fails.`,
      `Then the government makes its point: federal troops march Burns down State Street to a waiting ship while fifty thousand Bostonians line the route, bells tolling, buildings draped in black. It costs an estimated forty thousand dollars to return one man to slavery — and every dollar teaches the North what the Compromise really is.`,
    ],
    decisions: [
      {
        year: '1854',
        situation: `The plan is set. Going through the door means blood may follow.`,
        question: `A just cause does not make a killing weightless. Is a life taken to try to free a man in chains a price worth paying — and who are you once you've paid it?`,
        options: [
          { label: 'A', text: `Lead the assault.`,
            consequence: `You go through knowing the risk. A marshal is killed; Burns is not freed. You've crossed a line that can't be uncrossed, and you'll carry a man's death for a rescue that failed.`,
            meters: { network: +6, enforcement: +12, conscience: +4, safety: -10 } },
          { label: 'B', text: `Hold back from lethal force; press the siege without the storm.`,
            consequence: `You won't trade a life for a life, even in a just cause. Burns is likelier lost — but no one dies by your hand.`,
            meters: { conscience: +6, network: -2, safety: -2 } },
        ],
      },
      {
        year: '1854',
        situation: `Burns is gone. The North is awake and furious.`,
        question: `Burns radicalized a moderate North in a single day. Is that the moment to reach for guns — or for the votes that outrage just handed you?`,
        options: [
          { label: 'A', text: `Point the fury toward Kansas and the coming fight.`,
            consequence: `You read the future correctly and start readying men and money for war.`,
            meters: { network: +8, enforcement: +6, safety: -4 } },
          { label: 'B', text: `Point it toward the ballot and the new antislavery politics.`,
            consequence: `You bet the outrage becomes votes — a Republican North that boxes slavery in.`,
            meters: { conscience: +10, network: +2 } },
        ],
      },
    ],
    hingeQuestion: {
      question: `The Anthony Burns case (1854), occurring alongside the Kansas-Nebraska Act, is significant as a turning point because it —`,
      options: [
        `convinced most Northerners to accept the expansion of slavery`,
        `pushed many previously moderate Northerners toward the antislavery cause`,
        `ended the practice of returning freedom seekers to the South`,
        `resolved the sectional crisis over slavery in the territories`,
      ],
      correctIndex: 1,
      explanation: `The costly, military return of Anthony Burns — coming just as the Kansas-Nebraska Act reopened the question of slavery in the territories — pushed formerly moderate Northerners toward abolitionism, as the mill owner Amos Lawrence famously admitted. It did not end renditions or settle the territorial crisis; instead it hardened Northern opinion. Burns is a classic turning point: an event that visibly shifted the direction of public sentiment.`,
      regentsSkill: 'Turning Points',
    },
  },

  // ═══════════════════════════════════════════════════════
  // CHAPTER 7 — Guns for Brown
  // ═══════════════════════════════════════════════════════
  {
    id: 7, title: 'Guns for Brown', accentColor: ACCENT,
    roleId: 'hayden', subtitle: 'Boston · 1857–1861',
    role: 'Lewis Hayden — elder of the resistance',
    years: '1857–1861',
    quote: `"I, John Brown, am now quite certain that the crimes of this guilty land will never be purged away but with blood."`,
    quoteSource: 'John Brown, final written statement, December 2, 1859',
    context: [
      `The compromises are dead. In 1857, Dred Scott rules that Black people — free or enslaved — are not citizens and have no rights a white man is bound to respect. The law has said aloud what you always knew it meant.`,
      `Then John Brown comes to Boston, raising money and men for something enormous and secret — a strike at the heart of slavery at Harpers Ferry. He wants your help.`,
      `By 1861 the South is leaving the Union, and the war you've seen coming since the courthouse steps is here.`,
    ],
    decisions: [
      {
        year: '1859',
        situation: `Brown lays out the plan. Every patient path has already failed.`,
        question: `Every patient path has failed. Do you gamble everything on one violent act that might change history — or might destroy the network that has quietly freed hundreds?`,
        options: [
          { label: 'A', text: `Fund him.`,
            consequence: `You bet on the fire. Whatever Harpers Ferry becomes — martyrdom, massacre, the spark of war — your hands are on it.`,
            meters: { network: +8, conscience: +6, enforcement: +10, safety: -8 } },
          { label: 'B', text: `Withhold money but keep his secret.`,
            consequence: `You won't fund the raid, won't betray the man. A middle path that satisfies no one, including you.`,
            meters: { network: +2, safety: +2 } },
          { label: 'C', text: `Refuse and warn him off.`,
            consequence: `Prudent — and it may cost you the respect of men who think the time for prudence is over.`,
            meters: { safety: +6, network: -6, conscience: -2 } },
        ],
      },
      {
        year: '1861',
        situation: `The South secedes. The country needs Black hands and hasn't decided what it will pay for them.`,
        question: `Was there ever a compromise that could have held — or was the whole thing complicity, waiting for someone brave enough to name it?`,
        options: [
          { label: 'A', text: `Push Boston's Black men toward the fight.`,
            consequence: `Make this a war of liberation whether Washington means it to be or not. You begin the work that will fill the ranks of the 54th Massachusetts — service as a claim on a country that owes you everything and admits nothing.`,
            meters: { conscience: +10, network: +8, safety: -4 } },
          { label: 'B', text: `Demand the Union commit to emancipation first.`,
            consequence: `Leverage in the one moment the country needs you — and it may cost the movement the chance to shape the war from inside.`,
            meters: { network: +4, conscience: +4, enforcement: -2 } },
        ],
      },
    ],
    hingeQuestion: {
      question: `The Dred Scott decision (1857), John Brown's raid (1859), and Southern secession (1860–1861) together show that, by 1861 —`,
      options: [
        `sectional compromise had successfully preserved the Union`,
        `the North and South had resolved their differences over slavery`,
        `the decades-long strategy of compromise over slavery had collapsed into open conflict`,
        `slavery had been peacefully abolished across the nation`,
      ],
      correctIndex: 2,
      explanation: `Dred Scott denied Black Americans citizenship and any rights the government was bound to respect; John Brown's raid showed that some had turned to violence to end slavery; and secession followed Lincoln's election. Taken together, these events mark the collapse of the compromise strategy — Missouri, 1850, Kansas-Nebraska — that had held the Union together for decades. The nation's long effort to bargain over slavery gave way to war, the change-over-time point at the heart of Hayden's story.`,
      regentsSkill: 'Continuity & Change',
    },
  },
]

export const game = {
  meta: {
    slug: 'last-compromise-game',
    standard: '11.3',
    title: '1850',
    subtitle: 'The Last Compromise',
    accent: ACCENT, // #5AA57B — accentFor("11.3"), antebellum green (token file)
    period: 'US History · 11R · Regents Aligned',
    saveKey: 'last_compromise_save_v1',
    subdomain: 'last-compromise-game.flashpointhistory.com',
    standardsLine: '11.3 · Expansion, Sectionalism & Civil War',
    deck: `Seven chapters, one life. Lewis Hayden — self-emancipated from Kentucky, Boston shopkeeper, Underground Railroad conductor — deciding again and again how far to go to defy a law that made freedom a crime.`,
    tagline: `At what point does compromise become complicity — and was there ever a compromise that could have held?`,
    roles: ['Lewis Hayden'],
    // Verdict = highest gauge at game end; tie → first verdict listed (brief §5).
    verdictMode: 'highestGauge',
  },

  meters: { init, config: meterConfig },

  // Text-first ship — art is a separate backlog track (brief §6). Empty slots
  // render the exact text-only path; any key added here flips that slot to art.
  images: {
    hero: '',
    chapterBackdrops: {},
    portraits: {},
    inserts: {},
  },

  chapters,
  verdicts,
}

export default game
