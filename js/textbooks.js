/* ============================================================
   EduQuest · textbooks.js
   多教材数据。每个教材含若干单元，单元结构与旧版 UNITS 一致：
   vocab / grammar / npc / story / bossExtra
   选中某教材时，main.js 调用 selectBook() 把该教材单元灌入全局 UNITS
   ============================================================ */
'use strict';

/* ---------- 教材库 ---------- */
const TEXTBOOKS = [
/* ================= 教材 0：Cambridge Power Up 4（原版，9 单元） ================= */
{
  id: 0, name: "Power Up 4", publisher: "Cambridge", grade: "小学高年级", color: "#7b5cff",
  desc: "剑桥官方考级体系教材，主题丰富、语法系统，适合有一定基础的孩子。",
  units: [
    {
      id: 1, name: "This year's trip", biome: "驿站沙漠", biomeEn: "Oasis Outpost", icon: "🏜️",
      mission: "Prepare a holiday planner for this school year", missionZh: "做一份学年旅行计划",
      vocab: [
        { en: "January", zh: "一月", ex: "The school year starts in January.", tier: "common", icon: "🗓️" },
        { en: "February", zh: "二月", ex: "February is a short month.", tier: "common", icon: "🗓️" },
        { en: "March", zh: "三月", ex: "We go camping in March.", tier: "common", icon: "🗓️" },
        { en: "April", zh: "四月", ex: "It might rain in April.", tier: "common", icon: "🗓️" },
        { en: "May", zh: "五月", ex: "May is my favourite month.", tier: "common", icon: "🗓️" },
        { en: "June", zh: "六月", ex: "School finishes in June.", tier: "common", icon: "🗓️" },
        { en: "July", zh: "七月", ex: "We travel in July.", tier: "common", icon: "🗓️" },
        { en: "August", zh: "八月", ex: "August is very hot.", tier: "common", icon: "🗓️" },
        { en: "September", zh: "九月", ex: "A new term starts in September.", tier: "core", icon: "🗓️" },
        { en: "October", zh: "十月", ex: "Halloween is in October.", tier: "core", icon: "🗓️" },
        { en: "November", zh: "十一月", ex: "It gets cold in November.", tier: "core", icon: "🗓️" },
        { en: "December", zh: "十二月", ex: "Christmas is in December.", tier: "core", icon: "🗓️" },
        { en: "first", zh: "第一", ex: "My birthday is on the first of May.", tier: "common", icon: "🥇" },
        { en: "second", zh: "第二", ex: "Tuesday is the second day.", tier: "common", icon: "🥈" },
        { en: "third", zh: "第三", ex: "March is the third month.", tier: "core", icon: "🥉" },
        { en: "journey", zh: "旅程", ex: "The journey takes two hours.", tier: "core", icon: "🧭" },
        { en: "suitcase", zh: "手提箱", ex: "Pack your suitcase tonight.", tier: "core", icon: "🧳" },
        { en: "passport", zh: "护照", ex: "Do not forget your passport!", tier: "challenge", icon: "🛂" },
        { en: "ticket", zh: "票", ex: "I have got two train tickets.", tier: "core", icon: "🎫" },
        { en: "boots", zh: "靴子", ex: "You may need a strong pair of boots.", tier: "challenge", icon: "🥾" },
        { en: "desert", zh: "沙漠", ex: "The Arabian Desert is very big.", tier: "diamond", icon: "🏜️" },
        { en: "climate", zh: "气候", ex: "What is the climate like there?", tier: "diamond", icon: "🌡️" }
      ],
      grammar: [
        { name: "might 可能", point: "might/may 表推测", tokens: ["It", "might", "be", "hot"], distract: ["is", "was"], explain: "might + 动词原形：可能会……" },
        { name: "may 可能", point: "might/may 表推测", tokens: ["You", "may", "need", "boots"], distract: ["are", "do"], explain: "may + 动词原形：可能需要……" },
        { name: "everywhere", point: "不定代词", tokens: ["I", "looked", "everywhere", "for", "my", "ticket"], distract: ["somewhere", "nowhere"], explain: "everywhere = 到处" },
        { name: "someone", point: "不定代词", tokens: ["Someone", "took", "my", "suitcase"], distract: ["everyone", "no-one"], explain: "someone = 某人" },
        { name: "nothing", point: "不定代词", tokens: ["There", "is", "nothing", "in", "my", "bag"], distract: ["something", "everything"], explain: "nothing = 什么也没有" },
        { name: "anyone", point: "不定代词（疑问句）", tokens: ["Did", "anyone", "call", "me"], distract: ["someone", "everyone"], explain: "疑问句里用 anyone" }
      ],
      npc: [
        { name: "站长 Omar", avatar: "🧔", intro: "欢迎来到绿洲车站！帮我排好今天的车次表。", steps: [
          { say: "The first train leaves in March. Which month is the first one?", q: "三月是一年中第几个月?", options: ["the first month", "the second month", "the third month"], a: "the third month" },
          { say: "Good! A passenger lost something. 'I looked ___ for my passport.'", q: "选词填空", options: ["everywhere", "nowhere", "anything"], a: "everywhere" },
          { say: "It ___ be hot in the desert. Take water!", q: "选词填空", options: ["might", "is", "are"], a: "might" }
        ] },
        { name: "旅行家 Aisha", avatar: "👩‍🦱", intro: "我在做旅行计划，帮帮我！", steps: [
          { say: "You may need a strong pair of ___ in the mountains.", q: "选词填空", options: ["boots", "tickets", "maps"], a: "boots" },
          { say: "December is the ___ month of the year.", q: "选词填空", options: ["tenth", "eleventh", "twelfth"], a: "twelfth" },
          { say: "Did ___ see my suitcase?", q: "选词填空", options: ["anyone", "everyone", "no-one"], a: "anyone" }
        ] }
      ],
      story: { title: "The Lion of the Seas", icon: "🌊", paras: [
        "Sailors long ago told stories about a great lion of the seas. It was not really a lion — it was a huge wave that crashed onto the ships.",
        "The sailors were brave. They learned about the climate and the winds, so they could travel safely across the ocean.",
        "Today, scientists study the sea and the climate zones, and ships are much safer. But the old stories are still exciting!"
      ], questions: [
        { q: "What was the lion of the seas really?", options: ["A real lion", "A huge wave", "A big fish"], a: "A huge wave" },
        { q: "Who studies the sea today?", options: ["Sailors", "Scientists", "Farmers"], a: "Scientists" }
      ] },
      bossExtra: [
        { type: "read", passage: "Sam is planning a journey. He packs his suitcase in June. He takes his passport, two tickets and a strong pair of boots.", q: "When does Sam pack his suitcase?", options: ["In June", "In July", "In January"], a: "In June" },
        { type: "mc", q: "Which month comes AFTER October?", options: ["September", "November", "August"], a: "November" },
        { type: "mc", q: "'January is the ___ month of the year.'", options: ["first", "second", "third"], a: "first" }
      ]
    },
    {
      id: 2, name: "Our beautiful planet", biome: "丛林保护区", biomeEn: "Jungle Reserve", icon: "🌳",
      mission: "Write an explorer's expedition diary", missionZh: "写一份探险家考察日记",
      vocab: [
        { en: "river", zh: "河流", ex: "The river is long and wide.", tier: "common", icon: "🏞️" },
        { en: "mountain", zh: "高山", ex: "The mountain is very high.", tier: "common", icon: "⛰️" },
        { en: "forest", zh: "森林", ex: "Many animals live in the forest.", tier: "common", icon: "🌲" },
        { en: "ocean", zh: "海洋", ex: "Whales live in the ocean.", tier: "common", icon: "🌊" },
        { en: "island", zh: "岛屿", ex: "The island is small and green.", tier: "core", icon: "🏝️" },
        { en: "waterfall", zh: "瀑布", ex: "The waterfall is beautiful.", tier: "core", icon: "💦" },
        { en: "kangaroo", zh: "袋鼠", ex: "Kangaroos live in Australia.", tier: "common", icon: "🦘" },
        { en: "koala", zh: "考拉", ex: "The koala sleeps all day.", tier: "core", icon: "🐨" },
        { en: "whale", zh: "鲸", ex: "The whale is the biggest animal.", tier: "core", icon: "🐋" },
        { en: "shark", zh: "鲨鱼", ex: "The shark has sharp teeth.", tier: "core", icon: "🦈" },
        { en: "eagle", zh: "鹰", ex: "The eagle flies very high.", tier: "challenge", icon: "🦅" },
        { en: "turtle", zh: "海龟", ex: "The turtle swims slowly.", tier: "core", icon: "🐢" },
        { en: "endangered", zh: "濒危的", ex: "Tigers are endangered animals.", tier: "diamond", icon: "🆘" },
        { en: "plastic", zh: "塑料", ex: "There is too much plastic in the sea.", tier: "diamond", icon: "🥤" }
      ],
      grammar: [
        { name: "ago 过去式", point: "一般过去时 + ago", tokens: ["We", "got", "here", "a", "week", "ago"], distract: ["before", "later"], explain: "一段时间 + ago：……以前" },
        { name: "过去式否定", point: "一般过去时", tokens: ["We", "didn't", "visit", "Uluru"], distract: ["don't", "wasn't"], explain: "过去式否定：didn't + 动词原形" },
        { name: "too much", point: "too/enough", tokens: ["There's", "too", "much", "plastic"], distract: ["enough", "many"], explain: "too much + 不可数名词：太多……" },
        { name: "not enough", point: "too/enough", tokens: ["There", "isn't", "enough", "water"], distract: ["too", "much"], explain: "not enough + 名词：不够……" }
      ],
      npc: [
        { name: "护林员 Ruby", avatar: "👩‍🌾", intro: "保护动物需要你的帮助！", steps: [
          { say: "There is too ___ plastic in the ocean.", q: "选词填空", options: ["much", "many", "enough"], a: "much" },
          { say: "We ___ a koala here two days ago.", q: "选词填空", options: ["saw", "see", "seeing"], a: "saw" }
        ] },
        { name: "探险家 Max", avatar: "🧑‍🚀", intro: "我在写考察日记，帮我检查！", steps: [
          { say: "'Did you ___ away last month?' — help me finish!", q: "选词填空", options: ["go", "went", "going"], a: "go" },
          { say: "There isn't ___ water in the desert.", q: "选词填空", options: ["enough", "too", "much"], a: "enough" }
        ] }
      ],
      story: { title: "When Dad Lost His Glasses", icon: "👓", paras: [
        "Dad lost his glasses on our trip to the forest. He looked everywhere — in the tent, under the map, inside his boots!",
        "We all helped. Mum looked by the river, I looked near the waterfall, and our dog Biscuit looked under the trees.",
        "Then Biscuit barked happily. The glasses were on Dad's head all the time!"
      ], questions: [
        { q: "Where did Dad lose his glasses?", options: ["In the forest", "At school", "In the ocean"], a: "In the forest" },
        { q: "Where were the glasses?", options: ["Under the map", "On Dad's head", "In the river"], a: "On Dad's head" }
      ] },
      bossExtra: [
        { type: "read", passage: "Kangaroos and koalas live in Australia. Today people work hard to save these beautiful animals.", q: "Where do kangaroos live?", options: ["Australia", "England", "Brazil"], a: "Australia" },
        { type: "mc", q: "'I visited the island three days ___.'", options: ["ago", "before", "later"], a: "ago" }
      ]
    },
    {
      id: 3, name: "Let's celebrate!", biome: "狂欢节村庄", biomeEn: "Festival Village", icon: "🎉",
      mission: "Have a class quiz in teams", missionZh: "分组进行班级知识竞赛",
      vocab: [
        { en: "competition", zh: "比赛", ex: "We won the music competition.", tier: "common", icon: "🏆" },
        { en: "prize", zh: "奖品", ex: "She won first prize.", tier: "common", icon: "🎁" },
        { en: "winner", zh: "获胜者", ex: "The winner gets a medal.", tier: "core", icon: "🥇" },
        { en: "team", zh: "队伍", ex: "Our team has five players.", tier: "common", icon: "👥" },
        { en: "festival", zh: "节日", ex: "The festival starts in June.", tier: "common", icon: "🎊" },
        { en: "carnival", zh: "狂欢节", ex: "Brazil has a famous carnival.", tier: "core", icon: "🎭" },
        { en: "drum", zh: "鼓", ex: "He plays the drums in a band.", tier: "common", icon: "🥁" },
        { en: "guitar", zh: "吉他", ex: "She plays the guitar very well.", tier: "common", icon: "🎸" },
        { en: "piano", zh: "钢琴", ex: "I have just learned a piano song.", tier: "core", icon: "🎹" },
        { en: "violin", zh: "小提琴", ex: "The violin sounds beautiful.", tier: "core", icon: "🎻" },
        { en: "parade", zh: "游行", ex: "The carnival parade is amazing.", tier: "core", icon: "🎠" },
        { en: "stage", zh: "舞台", ex: "The band is on the stage.", tier: "core", icon: "🎤" },
        { en: "instrument", zh: "乐器", ex: "The guitar is a musical instrument.", tier: "diamond", icon: "🎶" }
      ],
      grammar: [
        { name: "ever 经历", point: "现在完成时（经历）", tokens: ["Have", "you", "ever", "eaten", "beans"], distract: ["Do", "Did"], explain: "Have you ever + 过去分词" },
        { name: "already", point: "现在完成时", tokens: ["I've", "already", "taken", "photos"], distract: ["yet", "never"], explain: "already = 已经" },
        { name: "yet 否定", point: "现在完成时", tokens: ["I", "haven't", "seen", "them", "yet"], distract: ["already", "just"], explain: "yet 用于否定句句尾" },
        { name: "never", point: "现在完成时", tokens: ["She", "has", "never", "won", "a", "prize"], distract: ["ever", "yet"], explain: "never = 从未" }
      ],
      npc: [
        { name: "村长 Fiona", avatar: "👵", intro: "狂欢节要来了！帮我筹备 quiz！", steps: [
          { say: "Have you ___ danced samba?", q: "选词填空", options: ["ever", "never", "yet"], a: "ever" },
          { say: "I've ___ taken more than 100 photos!", q: "选词填空", options: ["already", "yet", "never"], a: "already" }
        ] },
        { name: "鼓手 Bruno", avatar: "🧑‍🎤", intro: "我们乐队还缺人！", steps: [
          { say: "We haven't finished the song ___.", q: "选词填空", options: ["yet", "already", "ever"], a: "yet" },
          { say: "Which one is an instrument?", q: "哪个是乐器?", options: ["trumpet", "parade", "prize"], a: "trumpet" }
        ] }
      ],
      story: { title: "The Local Football Hero", icon: "⚽", paras: [
        "Everyone in our town knows big Dan. He has played football for twenty years and scored more than 200 goals!",
        "Last year Dan hurt his leg badly. Everyone thought he would never play again. But Dan trained every morning.",
        "Yesterday Dan played again and scored the winning goal! The town celebrated. Never give up."
      ], questions: [
        { q: "How many goals has Dan scored?", options: ["More than 200", "Exactly 20", "Only 2"], a: "More than 200" },
        { q: "What does the story teach us?", options: ["Never give up", "Football is easy", "Music is fun"], a: "Never give up" }
      ] },
      bossExtra: [
        { type: "read", passage: "The carnival in Brazil is famous. People wear costumes, dance samba in the parade, and play music all night.", q: "What do people dance at the carnival?", options: ["Samba", "Ballet", "Hip-hop"], a: "Samba" },
        { type: "mc", q: "'Have you ever ___ beans?'", options: ["eaten", "ate", "eat"], a: "eaten" }
      ]
    },
    {
      id: 4, name: "Let it snow!", biome: "四季雪山", biomeEn: "Snowpeak Station", icon: "❄️",
      mission: "Prepare a TV weather report", missionZh: "准备一份电视天气预报",
      vocab: [
        { en: "spring", zh: "春天", ex: "Flowers open in spring.", tier: "common", icon: "🌸" },
        { en: "summer", zh: "夏天", ex: "Summer is hot and sunny.", tier: "common", icon: "☀️" },
        { en: "autumn", zh: "秋天", ex: "Leaves fall in autumn.", tier: "common", icon: "🍂" },
        { en: "winter", zh: "冬天", ex: "It snows in winter.", tier: "common", icon: "⛄" },
        { en: "snow", zh: "雪", ex: "The snow is white and cold.", tier: "common", icon: "🌨️" },
        { en: "rain", zh: "雨", ex: "The rain is heavy today.", tier: "common", icon: "🌧️" },
        { en: "wind", zh: "风", ex: "The wind is strong.", tier: "core", icon: "💨" },
        { en: "cloud", zh: "云", ex: "There are grey clouds.", tier: "core", icon: "☁️" },
        { en: "storm", zh: "暴风雨", ex: "The storm was very loud.", tier: "challenge", icon: "⛈️" },
        { en: "sunny", zh: "晴朗的", ex: "It is a sunny day.", tier: "core", icon: "🌞" },
        { en: "weather", zh: "天气", ex: "What is the weather like?", tier: "core", icon: "🌦️" }
      ],
      grammar: [
        { name: "will 将来", point: "will/won't", tokens: ["I'll", "water", "the", "garden"], distract: ["won't", "don't"], explain: "will = 将要" },
        { name: "so 结果", point: "so/because", tokens: ["It's", "cold", "so", "we", "wear", "clothes"], distract: ["because", "but"], explain: "so = 所以（结果）" },
        { name: "because 原因", point: "so/because", tokens: ["We", "couldn't", "ski", "because", "it", "was", "foggy"], distract: ["so", "but"], explain: "because = 因为" }
      ],
      npc: [
        { name: "气象主播 Nina", avatar: "👩‍💼", intro: "今晚的天气预报由你来做！", steps: [
          { say: "It ___ snow tomorrow. Take your hat!", q: "选词填空", options: ["will", "is", "does"], a: "will" },
          { say: "We can't go out ___ there's a storm.", q: "选词填空", options: ["because", "so", "but"], a: "because" }
        ] },
        { name: "雪人 Tomás", avatar: "⛄", intro: "我快要融化了，快帮我！", steps: [
          { say: "It's hot, ___ the snowman is melting.", q: "选词填空", options: ["so", "because", "but"], a: "so" },
          { say: "Which season is the coldest?", q: "哪个季节最冷?", options: ["winter", "summer", "autumn"], a: "winter" }
        ] }
      ],
      story: { title: "Tomás and the Snowman", icon: "⛄", paras: [
        "Tomás built a big snowman in winter. But the next week it got warm. 'My snowman will melt!' he cried.",
        "He carried the snowman to the coldest place — the ice cream shop's freezer! Everyone laughed and helped.",
        "Now he always watches the weather report."
      ], questions: [
        { q: "Why was Tomás worried?", options: ["The snowman will melt", "The snowman was lost", "It was snowing"], a: "The snowman will melt" }
      ] },
      bossExtra: [
        { type: "mc", q: "'It was foggy, ___ we couldn't go skiing.'", options: ["so", "because", "but"], a: "so" }
      ]
    },
    {
      id: 5, name: "Working together", biome: "工匠小镇", biomeEn: "Tinker Town", icon: "🔧",
      mission: "Invent something to help with a job", missionZh: "发明一个帮助工作的机器",
      vocab: [
        { en: "doctor", zh: "医生", ex: "The doctor helps sick people.", tier: "common", icon: "🧑‍⚕️" },
        { en: "teacher", zh: "老师", ex: "Our teacher is very kind.", tier: "common", icon: "🧑‍🏫" },
        { en: "farmer", zh: "农民", ex: "The farmer grows vegetables.", tier: "common", icon: "🧑‍🌾" },
        { en: "pilot", zh: "飞行员", ex: "The pilot flies the plane.", tier: "core", icon: "🧑‍✈️" },
        { en: "chef", zh: "厨师", ex: "The chef cooks in a restaurant.", tier: "core", icon: "🧑‍🍳" },
        { en: "nurse", zh: "护士", ex: "The nurse works in a hospital.", tier: "core", icon: "👩‍⚕️" },
        { en: "artist", zh: "艺术家", ex: "The artist paints pictures.", tier: "core", icon: "🧑‍🎨" },
        { en: "robot", zh: "机器人", ex: "The robot can help doctors.", tier: "diamond", icon: "🤖" },
        { en: "job", zh: "工作", ex: "What job do you want?", tier: "common", icon: "💼" }
      ],
      grammar: [
        { name: "附加疑问 don't", point: "附加疑问句", tokens: ["You", "like", "robots", "don't", "you"], distract: ["do", "are"], explain: "前面肯定 → 后面否定" },
        { name: "附加疑问 can't", point: "附加疑问句", tokens: ["You", "can", "cycle", "can't", "you"], distract: ["can", "do"], explain: "can → can't you?" }
      ],
      npc: [
        { name: "发明家 Gogo", avatar: "🧑‍🔬", intro: "我的新机器人要完成了！", steps: [
          { say: "You like robots, ___ you?", q: "选词填空", options: ["don't", "do", "aren't"], a: "don't" },
          { say: "Which job flies a plane?", q: "哪个职业开飞机?", options: ["pilot", "chef", "farmer"], a: "pilot" }
        ] }
      ],
      story: { title: "Buddie the Robot", icon: "🤖", paras: [
        "Seo-joon built a small robot called Buddie. Buddie could carry books, clean floors and tell jokes!",
        "One day the library flooded. Buddie worked all night, carrying books to a dry place.",
        "'You aren't just a machine, are you? You're my friend.'"
      ], questions: [
        { q: "What is Buddie?", options: ["A robot", "A dog", "A teacher"], a: "A robot" }
      ] },
      bossExtra: [
        { type: "mc", q: "'You can swim, ___ you?'", options: ["can't", "can", "don't"], a: "can't" },
        { type: "mc", q: "Which person checks your teeth?", options: ["dentist", "artist", "pilot"], a: "dentist" }
      ]
    },
    {
      id: 6, name: "Then and now", biome: "时光博物馆", biomeEn: "Time Museum", icon: "🏺",
      mission: "Create an encyclopedia entry", missionZh: "写一条百科词条",
      vocab: [
        { en: "fridge", zh: "冰箱", ex: "The milk is in the fridge.", tier: "common", icon: "🧊" },
        { en: "mirror", zh: "镜子", ex: "Look in the mirror.", tier: "common", icon: "🪞" },
        { en: "shelf", zh: "架子", ex: "The books are on the shelf.", tier: "core", icon: "📚" },
        { en: "lamp", zh: "台灯", ex: "Turn on the lamp.", tier: "common", icon: "💡" },
        { en: "sofa", zh: "沙发", ex: "The cat sleeps on the sofa.", tier: "common", icon: "🛋️" },
        { en: "wooden", zh: "木制的", ex: "It is an old wooden chair.", tier: "core", icon: "🪵" },
        { en: "modern", zh: "现代的", ex: "Our new fridge is modern.", tier: "challenge", icon: "📱" },
        { en: "ancient", zh: "古代的", ex: "The pyramids are ancient.", tier: "diamond", icon: "🏛️" }
      ],
      grammar: [
        { name: "be used for", point: "be used for/to", tokens: ["It", "was", "used", "for", "keeping", "food"], distract: ["cook", "cooked"], explain: "be used for + doing" },
        { name: "be used to", point: "be used for/to", tokens: ["It", "was", "used", "to", "cook", "food"], distract: ["cooking", "cooked"], explain: "be used to + 动词原形" }
      ],
      npc: [
        { name: "馆长 Penny", avatar: "👩‍🏫", intro: "博物馆的古今展品需要整理！", steps: [
          { say: "Long ago, this box was used ___ keeping food cold.", q: "选词填空", options: ["for", "to", "at"], a: "for" },
          { say: "Which one is wooden?", q: "哪个是木制的?", options: ["wooden chair", "metal key", "plastic cup"], a: "wooden chair" }
        ] }
      ],
      story: { title: "The Boy King", icon: "🤴", paras: [
        "Tutankhamun became king of Egypt when he was only nine years old.",
        "He died young, and people buried him in a tomb full of gold. For 3000 years nobody found it.",
        "In 1922 explorers found the tomb. The whole world learned about the boy king."
      ], questions: [
        { q: "How old was Tutankhamun when he became king?", options: ["Nine", "Nineteen", "Ninety"], a: "Nine" }
      ] },
      bossExtra: [
        { type: "mc", q: "'It was used ___ cook food.'", options: ["to", "for", "at"], a: "to" }
      ]
    },
    {
      id: 7, name: "Space travel", biome: "太空站", biomeEn: "Starbase", icon: "🚀",
      mission: "Plan a space mission", missionZh: "计划一次太空任务",
      vocab: [
        { en: "planet", zh: "行星", ex: "Mars is a red planet.", tier: "common", icon: "🪐" },
        { en: "rocket", zh: "火箭", ex: "The rocket flies into space.", tier: "common", icon: "🚀" },
        { en: "astronaut", zh: "宇航员", ex: "The astronaut works on the ISS.", tier: "core", icon: "🧑‍🚀" },
        { en: "moon", zh: "月球", ex: "The moon is bright tonight.", tier: "common", icon: "🌙" },
        { en: "star", zh: "星星", ex: "I can see many stars.", tier: "common", icon: "⭐" },
        { en: "telescope", zh: "望远镜", ex: "We watch stars with a telescope.", tier: "core", icon: "🔭" },
        { en: "alien", zh: "外星人", ex: "The story is about a friendly alien.", tier: "core", icon: "👽" },
        { en: "helmet", zh: "头盔", ex: "Put on your space helmet.", tier: "core", icon: "🪖" },
        { en: "galaxy", zh: "星系", ex: "Our galaxy is the Milky Way.", tier: "diamond", icon: "🌌" }
      ],
      grammar: [
        { name: "will 预测", point: "will/going to", tokens: ["Spaceships", "will", "improve"], distract: ["improves", "improving"], explain: "will + 动词原形表预测" },
        { name: "going to 计划", point: "will/going to", tokens: ["Are", "you", "going", "to", "watch", "films"], distract: ["will", "do"], explain: "be going to + 动词原形" }
      ],
      npc: [
        { name: "宇航员 Sara", avatar: "🧑‍🚀", intro: "火星任务需要你加入！", steps: [
          { say: "We ___ going to launch at nine.", q: "选词填空", options: ["are", "is", "will"], a: "are" },
          { say: "What do astronauts wear on their heads?", q: "宇航员头上戴什么?", options: ["helmet", "carpet", "costume"], a: "helmet" }
        ] }
      ],
      story: { title: "The Space Blog", icon: "🛰️", paras: [
        "Day 45: I was turning off my engine when I heard a strange noise. Tap, tap, tap.",
        "I looked everywhere. Then I laughed — it was my robot mouse, Cheese, tapping on the window!",
        "I am going to send my family a video message tonight."
      ], questions: [
        { q: "What was the strange noise?", options: ["The robot mouse", "An alien", "The engine"], a: "The robot mouse" }
      ] },
      bossExtra: [
        { type: "mc", q: "'Are you going to ___ films?'", options: ["watch", "watches", "watched"], a: "watch" }
      ]
    },
    {
      id: 8, name: "Great bakers", biome: "烘焙王国", biomeEn: "Bakery Kingdom", icon: "🍰",
      mission: "Take part in a cooking competition", missionZh: "参加一场烹饪比赛",
      vocab: [
        { en: "breakfast", zh: "早餐", ex: "I have breakfast at seven.", tier: "common", icon: "🍳" },
        { en: "lunch", zh: "午餐", ex: "We have lunch at school.", tier: "common", icon: "🍱" },
        { en: "dinner", zh: "晚餐", ex: "Dinner is at six.", tier: "common", icon: "🍽️" },
        { en: "bread", zh: "面包", ex: "The bread smells wonderful.", tier: "common", icon: "🍞" },
        { en: "cheese", zh: "奶酪", ex: "It tastes like cheese.", tier: "core", icon: "🧀" },
        { en: "cake", zh: "蛋糕", ex: "It smells like carrot cake.", tier: "common", icon: "🍰" },
        { en: "soup", zh: "汤", ex: "The soup is hot.", tier: "core", icon: "🍲" },
        { en: "recipe", zh: "食谱", ex: "Follow the recipe.", tier: "challenge", icon: "📜" },
        { en: "oven", zh: "烤箱", ex: "The cake is in the oven.", tier: "challenge", icon: "🔥" }
      ],
      grammar: [
        { name: "smells like", point: "感官动词 + like", tokens: ["It", "smells", "like", "carrot", "cake"], distract: ["smell", "smelling"], explain: "It smells like + 名词" },
        { name: "tastes like", point: "感官动词 + like", tokens: ["It", "tastes", "like", "cheese"], distract: ["taste", "tasting"], explain: "It tastes like + 名词" }
      ],
      npc: [
        { name: "烘焙师 Bella", avatar: "👩‍🍳", intro: "烹饪大赛马上开始！", steps: [
          { say: "Mmm! It smells ___ carrot cake.", q: "选词填空", options: ["like", "as", "for"], a: "like" },
          { say: "Where do we bake the cake?", q: "在哪里烤蛋糕?", options: ["oven", "fridge", "shelf"], a: "oven" }
        ] }
      ],
      story: { title: "The Gingerbread Girl", icon: "🍪", paras: [
        "An old woman baked a gingerbread girl. When she opened the oven, the girl jumped out and ran away!",
        "'Run, run, as fast as you can! You can't catch me!' she sang.",
        "At the river a clever fox said, 'Jump on my nose!' And SNAP!"
      ], questions: [
        { q: "Who baked the gingerbread girl?", options: ["An old woman", "A chef", "A fox"], a: "An old woman" }
      ] },
      bossExtra: [
        { type: "mc", q: "'It looks ___ a nest.'", options: ["like", "likes", "liked"], a: "like" }
      ]
    },
    {
      id: 9, name: "Time of our lives", biome: "故事城堡", biomeEn: "Story Castle", icon: "🏰",
      mission: "Write a chain story about a mystery", missionZh: "接龙写一个神秘故事",
      vocab: [
        { en: "clock", zh: "时钟", ex: "The clock on the wall is old.", tier: "common", icon: "🕐" },
        { en: "quarter", zh: "一刻钟", ex: "It is a quarter past four.", tier: "core", icon: "🕓" },
        { en: "half", zh: "一半", ex: "It is half past six.", tier: "common", icon: "🕡" },
        { en: "past", zh: "过（时间）", ex: "It is ten past nine.", tier: "core", icon: "⏰" },
        { en: "midnight", zh: "午夜", ex: "The party ended at midnight.", tier: "challenge", icon: "🌃" },
        { en: "noon", zh: "中午", ex: "We eat lunch at noon.", tier: "core", icon: "🌞" },
        { en: "diary", zh: "日记", ex: "She writes in her diary.", tier: "core", icon: "📔" },
        { en: "mystery", zh: "谜团", ex: "The old house is a mystery.", tier: "diamond", icon: "🔍" }
      ],
      grammar: [
        { name: "过去进行 while", point: "过去进行时", tokens: ["While", "I", "was", "reading", "a", "book"], distract: ["am", "were"], explain: "While + was/were doing" },
        { name: "since", point: "现在完成时 since/for", tokens: ["We've", "been", "here", "since", "four"], distract: ["for", "ago"], explain: "since + 时间点" },
        { name: "for", point: "现在完成时 since/for", tokens: ["We've", "been", "here", "for", "an", "hour"], distract: ["since", "ago"], explain: "for + 时间段" }
      ],
      npc: [
        { name: "守钟人 Tick", avatar: "🕰️", intro: "城堡的钟停了！", steps: [
          { say: "'We've been here ___ five past four.'", q: "选词填空", options: ["since", "for", "ago"], a: "since" },
          { say: "'It is a quarter ___ four.'", q: "选词填空", options: ["past", "to", "at"], a: "past" }
        ] }
      ],
      story: { title: "The Legend of Mother Mountain", icon: "⛰️", paras: [
        "Long ago, Mother Mountain watched over the villages. While the villagers were sleeping, she sang to the rivers.",
        "One year people cut down too many trees. Mother Mountain was sad, and the rivers dried up.",
        "They planted new trees, and the rivers came back."
      ], questions: [
        { q: "Why was Mother Mountain sad?", options: ["People cut trees", "People sang", "It snowed"], a: "People cut trees" }
      ] },
      bossExtra: [
        { type: "mc", q: "'We've lived here ___ ten years.'", options: ["for", "since", "ago"], a: "for" }
      ]
    }
  ]
},

/* ================= 教材 1：人教版 PEP 三年级上册（北京多用·真实内容） ================= */
{
  id: 1, name: "人教版 PEP 三上", publisher: "人民教育出版社", grade: "三年级起点", color: "#e8533f",
  desc: "全国通用、北京多数小学采用的英语教材，主题贴近生活，适合零基础启蒙。",
  units: [
    {
      id: 1, name: "Hello!", biome: "问候小镇", biomeEn: "Hello Town", icon: "👋",
      mission: "Greet friends and say your name", missionZh: "打招呼并介绍自己",
      vocab: [
        { en: "hello", zh: "你好", ex: "Hello, I am Sam.", tier: "common", icon: "👋" },
        { en: "hi", zh: "嗨", ex: "Hi, Miss White!", tier: "common", icon: "🙋" },
        { en: "I'm", zh: "我是", ex: "I'm Mike.", tier: "common", icon: "🙆" },
        { en: "name", zh: "名字", ex: "What is your name?", tier: "common", icon: "🏷️" },
        { en: "ruler", zh: "尺子", ex: "I have a ruler.", tier: "core", icon: "📏" },
        { en: "pencil", zh: "铅笔", ex: "This is my pencil.", tier: "core", icon: "✏️" },
        { en: "eraser", zh: "橡皮", ex: "I have an eraser.", tier: "core", icon: "🧽" },
        { en: "bag", zh: "书包", ex: "Open your bag.", tier: "common", icon: "🎒" },
        { en: "pen", zh: "钢笔", ex: "Show me your pen.", tier: "core", icon: "🖊️" },
        { en: "book", zh: "书", ex: "Close your book.", tier: "common", icon: "📘" },
        { en: "crayon", zh: "蜡笔", ex: "I have a crayon.", tier: "challenge", icon: "🖍️" },
        { en: "goodbye", zh: "再见", ex: "Goodbye, friends!", tier: "common", icon: "👋" }
      ],
      grammar: [
        { name: "I'm...", point: "自我介绍", tokens: ["I'm", "Mike"], distract: ["He", "Am"], explain: "I'm = I am，我是……" },
        { name: "What is your name?", point: "询问名字", tokens: ["What", "is", "your", "name"], distract: ["you", "are"], explain: "问别人名字" },
        { name: "I have a...", point: "表达拥有", tokens: ["I", "have", "a", "ruler"], distract: ["am", "is"], explain: "I have a + 物品" },
        { name: "Show me...", point: "指令", tokens: ["Show", "me", "your", "pen"], distract: ["Me", "You"], explain: "Show me = 给我看" }
      ],
      npc: [
        { name: "老师 Miss White", avatar: "👩‍🏫", intro: "欢迎来到英语课！先认识一下大家。", steps: [
          { say: "Hello! ___ am Sam.", q: "选词填空", options: ["I'm", "He", "You"], a: "I'm" },
          { say: "What is your ___?", q: "选词填空", options: ["name", "book", "pen"], a: "name" },
          { say: "I have a red ___.", q: "选词填空", options: ["pencil", "water", "cat"], a: "pencil" }
        ] },
        { name: "同学 Mike", avatar: "🧒", intro: "我们来互相认识吧！", steps: [
          { say: "Hi! I'm Mike. What is ___ name?", q: "选词填空", options: ["your", "my", "his"], a: "your" },
          { say: "Show me your ___.", q: "选词填空", options: ["ruler", "apple", "dog"], a: "ruler" }
        ] }
      ],
      story: { title: "Hello, Friends!", icon: "👋", paras: [
        "Hello! I am Sarah. This is my new school.",
        "Hi! I am John. What is your name? I am Mike.",
        "We are good friends now. Goodbye, see you tomorrow!"
      ], questions: [
        { q: "What does 'I'm' mean?", options: ["I am", "You are", "He is"], a: "I am" },
        { q: "Who is Sarah's friend?", options: ["Mike", "The cat", "The dog"], a: "Mike" }
      ] },
      bossExtra: [
        { type: "mc", q: "'I ___ Mike.'", options: ["am", "is", "are"], a: "am" },
        { type: "mc", q: "Which one is for writing?", options: ["pencil", "ruler", "bag"], a: "pencil" },
        { type: "mc", q: "'Show ___ your pen.'", options: ["me", "I", "my"], a: "me" }
      ]
    },
    {
      id: 2, name: "Colours!", biome: "彩虹工厂", biomeEn: "Rainbow Works", icon: "🌈",
      mission: "Name the colours you see", missionZh: "说出你看到的颜色",
      vocab: [
        { en: "red", zh: "红色", ex: "I see red.", tier: "common", icon: "🔴" },
        { en: "yellow", zh: "黄色", ex: "The sun is yellow.", tier: "common", icon: "🟡" },
        { en: "blue", zh: "蓝色", ex: "The sky is blue.", tier: "common", icon: "🔵" },
        { en: "green", zh: "绿色", ex: "The grass is green.", tier: "common", icon: "🟢" },
        { en: "black", zh: "黑色", ex: "I have a black cat.", tier: "core", icon: "⚫" },
        { en: "brown", zh: "棕色", ex: "The bear is brown.", tier: "core", icon: "🟤" },
        { en: "white", zh: "白色", ex: "Snow is white.", tier: "core", icon: "⚪" },
        { en: "orange", zh: "橙色", ex: "An orange is orange.", tier: "challenge", icon: "🟠" },
        { en: "colour", zh: "颜色", ex: "What colour is it?", tier: "common", icon: "🎨" }
      ],
      grammar: [
        { name: "I see...", point: "看见", tokens: ["I", "see", "red"], distract: ["am", "is"], explain: "I see + 颜色" },
        { name: "What colour?", point: "询问颜色", tokens: ["What", "colour", "is", "it"], distract: ["you", "are"], explain: "问颜色" },
        { name: "It is...", point: "它是", tokens: ["It", "is", "blue"], distract: ["am", "are"], explain: "It is + 颜色" }
      ],
      npc: [
        { name: "画家 Lisa", avatar: "🧑‍🎨", intro: "帮我给画上色吧！", steps: [
          { say: "The apple is ___.", q: "选词填空", options: ["red", "blue", "green"], a: "red" },
          { say: "What ___ is the sky?", q: "选词填空", options: ["colour", "name", "book"], a: "colour" },
          { say: "The bear is ___.", q: "选词填空", options: ["brown", "pink", "purple"], a: "brown" }
        ] }
      ],
      story: { title: "The Rainbow", icon: "🌈", paras: [
        "After the rain, I see a rainbow. It is red, orange, yellow, green, blue.",
        "The sun is yellow. The grass is green. The sky is blue.",
        "So many colours! I love the rainbow."
      ], questions: [
        { q: "What colour is the grass?", options: ["green", "red", "black"], a: "green" },
        { q: "When do we see a rainbow?", options: ["After rain", "At night", "In winter"], a: "After rain" }
      ] },
      bossExtra: [
        { type: "mc", q: "'I see ___ sky.'", options: ["blue", "red", "brown"], a: "blue" },
        { type: "mc", q: "Snow is ___", options: ["white", "black", "green"], a: "white" }
      ]
    },
    {
      id: 3, name: "Look at me!", biome: "身体乐园", biomeEn: "Body Park", icon: "🧍",
      mission: "Point to your body parts", missionZh: "指一指身体部位",
      vocab: [
        { en: "head", zh: "头", ex: "Touch your head.", tier: "common", icon: "🤕" },
        { en: "face", zh: "脸", ex: "Wash your face.", tier: "common", icon: "😊" },
        { en: "eye", zh: "眼睛", ex: "I have two eyes.", tier: "common", icon: "👁️" },
        { en: "ear", zh: "耳朵", ex: "Listen with your ear.", tier: "common", icon: "👂" },
        { en: "nose", zh: "鼻子", ex: "This is my nose.", tier: "common", icon: "👃" },
        { en: "mouth", zh: "嘴", ex: "Open your mouth.", tier: "core", icon: "👄" },
        { en: "arm", zh: "手臂", ex: "Raise your arm.", tier: "core", icon: "💪" },
        { en: "hand", zh: "手", ex: "Clap your hands.", tier: "core", icon: "✋" },
        { en: "leg", zh: "腿", ex: "My leg is long.", tier: "challenge", icon: "🦵" },
        { en: "foot", zh: "脚", ex: "Stamp your foot.", tier: "challenge", icon: "🦶" }
      ],
      grammar: [
        { name: "This is my...", point: "介绍身体", tokens: ["This", "is", "my", "nose"], distract: ["am", "are"], explain: "This is my + 部位" },
        { name: "Touch your...", point: "指令", tokens: ["Touch", "your", "head"], distract: ["You", "My"], explain: "Touch = 摸/指" },
        { name: "I have...", point: "拥有", tokens: ["I", "have", "two", "eyes"], distract: ["am", "is"], explain: "I have + 数量 + 部位" }
      ],
      npc: [
        { name: "医生 Doctor Li", avatar: "🧑‍⚕️", intro: "来体检一下身体吧！", steps: [
          { say: "Touch your ___.", q: "选词填空", options: ["nose", "book", "pen"], a: "nose" },
          { say: "This is my ___.", q: "选词填空", options: ["head", "red", "cat"], a: "head" },
          { say: "I have two ___.", q: "选词填空", options: ["eyes", "nose", "mouth"], a: "eyes" }
        ] }
      ],
      story: { title: "My Body", icon: "🧍", paras: [
        "This is my head. This is my face.",
        "I have two eyes, two ears, one nose and one mouth.",
        "I have two hands and two legs. My body is great!"
      ], questions: [
        { q: "How many eyes do you have?", options: ["Two", "One", "Three"], a: "Two" },
        { q: "What do you touch with?", options: ["hand", "nose", "ear"], a: "hand" }
      ] },
      bossExtra: [
        { type: "mc", q: "'Touch your ___ .'", options: ["ear", "apple", "book"], a: "ear" },
        { type: "mc", q: "'This is my ___ .'", options: ["mouth", "red", "blue"], a: "mouth" }
      ]
    },
    {
      id: 4, name: "We love animals", biome: "动物农场", biomeEn: "Animal Farm", icon: "🐶",
      mission: "Name the animals on the farm", missionZh: "说出农场里的动物",
      vocab: [
        { en: "cat", zh: "猫", ex: "I have a cat.", tier: "common", icon: "🐱" },
        { en: "dog", zh: "狗", ex: "The dog is big.", tier: "common", icon: "🐶" },
        { en: "duck", zh: "鸭子", ex: "A yellow duck.", tier: "common", icon: "🦆" },
        { en: "pig", zh: "猪", ex: "The pig is pink.", tier: "common", icon: "🐷" },
        { en: "bear", zh: "熊", ex: "A brown bear.", tier: "core", icon: "🐻" },
        { en: "elephant", zh: "大象", ex: "The elephant is big.", tier: "core", icon: "🐘" },
        { en: "monkey", zh: "猴子", ex: "The monkey is funny.", tier: "core", icon: "🐵" },
        { en: "bird", zh: "鸟", ex: "A small bird.", tier: "core", icon: "🐦" },
        { en: "tiger", zh: "老虎", ex: "The tiger is strong.", tier: "challenge", icon: "🐯" },
        { en: "panda", zh: "熊猫", ex: "The panda is cute.", tier: "challenge", icon: "🐼" },
        { en: "zoo", zh: "动物园", ex: "Let us go to the zoo!", tier: "common", icon: "🦁" }
      ],
      grammar: [
        { name: "It is a...", point: "介绍动物", tokens: ["It", "is", "a", "cat"], distract: ["am", "are"], explain: "It is a + 动物" },
        { name: "I have a...", point: "拥有", tokens: ["I", "have", "a", "dog"], distract: ["am", "is"], explain: "I have a + 动物" },
        { name: "What is this?", point: "提问", tokens: ["What", "is", "this"], distract: ["you", "are"], explain: "这是什么？" }
      ],
      npc: [
        { name: "饲养员 Tom", avatar: "🧑‍🌾", intro: "农场新来了动物，认识一下！", steps: [
          { say: "It is a ___ .", q: "选词填空", options: ["cat", "red", "book"], a: "cat" },
          { say: "I have a brown ___ .", q: "选词填空", options: ["bear", "nose", "arm"], a: "bear" },
          { say: "What is ___ ?", q: "选词填空", options: ["this", "these", "those"], a: "this" }
        ] }
      ],
      story: { title: "At the Zoo", icon: "🦁", paras: [
        "Let us go to the zoo! I see a panda and a tiger.",
        "The elephant is big. The monkey is funny.",
        "I love animals. They are our friends."
      ], questions: [
        { q: "What is big at the zoo?", options: ["elephant", "bird", "cat"], a: "elephant" },
        { q: "Where do they go?", options: ["the zoo", "school", "home"], a: "the zoo" }
      ] },
      bossExtra: [
        { type: "mc", q: "'It is a ___ .'", options: ["dog", "red", "book"], a: "dog" },
        { type: "mc", q: "Which animal is cute?", options: ["panda", "rock", "pen"], a: "panda" }
      ]
    },
    {
      id: 5, name: "Let's eat!", biome: "美食餐厅", biomeEn: "Yummy Cafe", icon: "🍎",
      mission: "Order food in English", missionZh: "用英语点餐",
      vocab: [
        { en: "bread", zh: "面包", ex: "I like bread.", tier: "common", icon: "🍞" },
        { en: "juice", zh: "果汁", ex: "Have some juice.", tier: "common", icon: "🧃" },
        { en: "egg", zh: "蛋", ex: "An egg for breakfast.", tier: "common", icon: "🥚" },
        { en: "milk", zh: "牛奶", ex: "I drink milk.", tier: "common", icon: "🥛" },
        { en: "water", zh: "水", ex: "I am thirsty. Water, please.", tier: "common", icon: "💧" },
        { en: "cake", zh: "蛋糕", ex: "A birthday cake.", tier: "core", icon: "🍰" },
        { en: "fish", zh: "鱼", ex: "I like fish.", tier: "core", icon: "🐟" },
        { en: "rice", zh: "米饭", ex: "We eat rice.", tier: "core", icon: "🍚" },
        { en: "hungry", zh: "饿的", ex: "I am hungry.", tier: "challenge", icon: "🤤" }
      ],
      grammar: [
        { name: "I like...", point: "喜欢", tokens: ["I", "like", "bread"], distract: ["am", "is"], explain: "I like + 食物" },
        { name: "Have some...", point: "邀请吃", tokens: ["Have", "some", "milk"], distract: ["Has", "You"], explain: "Have some + 食物" },
        { name: "I am hungry", point: "感受", tokens: ["I", "am", "hungry"], distract: ["is", "are"], explain: "我饿了" }
      ],
      npc: [
        { name: "厨师 Chef Wang", avatar: "🧑‍🍳", intro: "欢迎光临，想吃点什么？", steps: [
          { say: "I like ___ .", q: "选词填空", options: ["bread", "cat", "book"], a: "bread" },
          { say: "Have some ___ .", q: "选词填空", options: ["juice", "red", "nose"], a: "juice" },
          { say: "I am ___ .", q: "选词填空", options: ["hungry", "blue", "tall"], a: "hungry" }
        ] }
      ],
      story: { title: "The Picnic", icon: "🍎", paras: [
        "Today we have a picnic. I have bread, eggs and milk.",
        "Mum has juice and cake. Dad has fish and rice.",
        "We are full. The food is yummy!"
      ], questions: [
        { q: "What does the child have?", options: ["bread and milk", "a cat", "a book"], a: "bread and milk" }
      ] },
      bossExtra: [
        { type: "mc", q: "'I like ___ .'", options: ["cake", "red", "nose"], a: "cake" },
        { type: "mc", q: "What do we drink when thirsty?", options: ["water", "bread", "fish"], a: "water" }
      ]
    },
    {
      id: 6, name: "Happy birthday!", biome: "生日派对", biomeEn: "Birthday Party", icon: "🎂",
      mission: "Count and celebrate", missionZh: "数数并庆祝",
      vocab: [
        { en: "one", zh: "一", ex: "One apple.", tier: "common", icon: "1️⃣" },
        { en: "two", zh: "二", ex: "Two dogs.", tier: "common", icon: "2️⃣" },
        { en: "three", zh: "三", ex: "Three cats.", tier: "common", icon: "3️⃣" },
        { en: "four", zh: "四", ex: "Four books.", tier: "common", icon: "4️⃣" },
        { en: "five", zh: "五", ex: "Five birds.", tier: "common", icon: "5️⃣" },
        { en: "six", zh: "六", ex: "Six pencils.", tier: "core", icon: "6️⃣" },
        { en: "seven", zh: "七", ex: "Seven ducks.", tier: "core", icon: "7️⃣" },
        { en: "eight", zh: "八", ex: "Eight eggs.", tier: "core", icon: "8️⃣" },
        { en: "nine", zh: "九", ex: "Nine rulers.", tier: "challenge", icon: "9️⃣" },
        { en: "ten", zh: "十", ex: "Ten crayons.", tier: "challenge", icon: "🔟" },
        { en: "birthday", zh: "生日", ex: "Happy birthday!", tier: "common", icon: "🎂" }
      ],
      grammar: [
        { name: "How old?", point: "询问年龄", tokens: ["How", "old", "are", "you"], distract: ["you", "is"], explain: "你几岁了？" },
        { name: "I am ... years old", point: "回答年龄", tokens: ["I", "am", "seven"], distract: ["is", "are"], explain: "我X岁" },
        { name: "This is...", point: "这是", tokens: ["This", "is", "a", "gift"], distract: ["am", "are"], explain: "这是……" }
      ],
      npc: [
        { name: "寿星 Lily", avatar: "🧒", intro: "今天是我的生日派对！", steps: [
          { say: "How old are ___ ?", q: "选词填空", options: ["you", "your", "I"], a: "you" },
          { say: "I am ___ .", q: "选词填空", options: ["seven", "cat", "red"], a: "seven" },
          { say: "This is a ___ .", q: "选词填空", options: ["gift", "nose", "book"], a: "gift" }
        ] }
      ],
      story: { title: "Lily's Birthday", icon: "🎂", paras: [
        "Today is Lily's birthday. She is seven years old.",
        "We have a cake, ten candles and many gifts.",
        "Happy birthday, Lily! We sing and dance."
      ], questions: [
        { q: "How old is Lily?", options: ["seven", "three", "ten"], a: "seven" },
        { q: "What do they have?", options: ["a cake", "a cat", "a book"], a: "a cake" }
      ] },
      bossExtra: [
        { type: "mc", q: "'I am ___ .'", options: ["eight", "cat", "red"], a: "eight" },
        { type: "mc", q: "How many candles? (ten)", options: ["ten", "two", "one"], a: "ten" }
      ]
    }
  ]
},

/* ================= 教材 2：外研社 新标准 一年级起点（样例 3 单元） ================= */
{
  id: 2, name: "外研社 新标准 一上", publisher: "外语教学与研究出版社", grade: "一年级起点", color: "#2aa198",
  desc: "北京部分小学一年级起点的英语教材，词汇更基础、听说先行。",
  units: [
    {
      id: 1, name: "Hello, I'm Sam", biome: "晨光校园", biomeEn: "Morning School", icon: "🌅",
      mission: "Say hello and your name", missionZh: "打招呼并说名字",
      vocab: [
        { en: "hello", zh: "你好", ex: "Hello, I'm Sam.", tier: "common", icon: "👋" },
        { en: "good", zh: "好的", ex: "Good morning!", tier: "common", icon: "👍" },
        { en: "morning", zh: "早晨", ex: "Good morning, teacher.", tier: "common", icon: "🌞" },
        { en: "boy", zh: "男孩", ex: "He is a boy.", tier: "core", icon: "🧒" },
        { en: "girl", zh: "女孩", ex: "She is a girl.", tier: "core", icon: "👧" },
        { en: "name", zh: "名字", ex: "What is your name?", tier: "common", icon: "🏷️" },
        { en: "fine", zh: "很好", ex: "I am fine, thank you.", tier: "common", icon: "😊" },
        { en: "thank", zh: "谢谢", ex: "Thank you!", tier: "common", icon: "🙏" }
      ],
      grammar: [
        { name: "Good morning", point: "问候", tokens: ["Good", "morning"], distract: ["Good", "night"], explain: "早上好" },
        { name: "I'm...", point: "介绍", tokens: ["I'm", "Sam"], distract: ["He", "Am"], explain: "我是……" },
        { name: "I am fine", point: "回答近况", tokens: ["I", "am", "fine"], distract: ["is", "are"], explain: "我很好" }
      ],
      npc: [
        { name: "老师 Ms Smart", avatar: "👩‍🏫", intro: "Good morning, children!", steps: [
          { say: "___ morning, teacher!", q: "选词填空", options: ["Good", "Bad", "Bye"], a: "Good" },
          { say: "I'm ___ .", q: "选词填空", options: ["Sam", "cat", "red"], a: "Sam" },
          { say: "I am ___ , thank you.", q: "选词填空", options: ["fine", "boy", "book"], a: "fine" }
        ] }
      ],
      story: { title: "First Day", icon: "🌅", paras: [
        "Good morning! I am Sam. I am a boy.",
        "Good morning! I am Amy. I am a girl.",
        "We are friends. We are fine."
      ], questions: [
        { q: "Who is a boy?", options: ["Sam", "Amy", "The cat"], a: "Sam" }
      ] },
      bossExtra: [
        { type: "mc", q: "'Good ___ !'", options: ["morning", "night", "bye"], a: "morning" }
      ]
    },
    {
      id: 2, name: "How many?", biome: "数数乐园", biomeEn: "Count Park", icon: "🔢",
      mission: "Count things around you", missionZh: "数一数身边的东西",
      vocab: [
        { en: "one", zh: "一", ex: "One ball.", tier: "common", icon: "1️⃣" },
        { en: "two", zh: "二", ex: "Two books.", tier: "common", icon: "2️⃣" },
        { en: "three", zh: "三", ex: "Three cats.", tier: "common", icon: "3️⃣" },
        { en: "four", zh: "四", ex: "Four dogs.", tier: "common", icon: "4️⃣" },
        { en: "five", zh: "五", ex: "Five birds.", tier: "core", icon: "5️⃣" },
        { en: "door", zh: "门", ex: "Open the door.", tier: "core", icon: "🚪" },
        { en: "window", zh: "窗户", ex: "Close the window.", tier: "core", icon: "🪟" },
        { en: "chair", zh: "椅子", ex: "Sit on the chair.", tier: "challenge", icon: "🪑" }
      ],
      grammar: [
        { name: "How many?", point: "询问数量", tokens: ["How", "many", "books"], distract: ["you", "is"], explain: "多少……？" },
        { name: "I can see...", point: "我看到", tokens: ["I", "can", "see", "two"], distract: ["am", "is"], explain: "我能看到……" }
      ],
      npc: [
        { name: "同学 Lingling", avatar: "👧", intro: "我们一起来数数！", steps: [
          { say: "How ___ books?", q: "选词填空", options: ["many", "much", "are"], a: "many" },
          { say: "I can see ___ cats.", q: "选词填空", options: ["three", "red", "book"], a: "three" }
        ] }
      ],
      story: { title: "In the Classroom", icon: "🔢", paras: [
        "Look! One door, two windows, three chairs.",
        "I can see four books and five birds.",
        "So many things in our classroom!"
      ], questions: [
        { q: "How many chairs?", options: ["three", "one", "five"], a: "three" }
      ] },
      bossExtra: [
        { type: "mc", q: "'How ___ dogs?'", options: ["many", "much", "are"], a: "many" }
      ]
    },
    {
      id: 3, name: "My colours", biome: "调色板屋", biomeEn: "Paint House", icon: "🎨",
      mission: "Name colours", missionZh: "说出颜色",
      vocab: [
        { en: "red", zh: "红色", ex: "A red apple.", tier: "common", icon: "🔴" },
        { en: "blue", zh: "蓝色", ex: "The blue sky.", tier: "common", icon: "🔵" },
        { en: "green", zh: "绿色", ex: "Green grass.", tier: "common", icon: "🟢" },
        { en: "yellow", zh: "黄色", ex: "A yellow sun.", tier: "common", icon: "🟡" },
        { en: "black", zh: "黑色", ex: "A black cat.", tier: "core", icon: "⚫" },
        { en: "white", zh: "白色", ex: "White snow.", tier: "core", icon: "⚪" },
        { en: "colour", zh: "颜色", ex: "What colour?", tier: "common", icon: "🌈" }
      ],
      grammar: [
        { name: "It is...", point: "它是", tokens: ["It", "is", "red"], distract: ["am", "are"], explain: "它是……" },
        { name: "What colour?", point: "问颜色", tokens: ["What", "colour", "is", "it"], distract: ["you", "are"], explain: "什么颜色？" }
      ],
      npc: [
        { name: "画家 Daming", avatar: "🧑‍🎨", intro: "帮我把画涂色！", steps: [
          { say: "The sky is ___ .", q: "选词填空", options: ["blue", "red", "cat"], a: "blue" },
          { say: "What ___ is the sun?", q: "选词填空", options: ["colour", "name", "book"], a: "colour" }
        ] }
      ],
      story: { title: "My Picture", icon: "🎨", paras: [
        "I draw a red sun and a blue sky.",
        "The grass is green. The cat is black and white.",
        "My picture is colourful!"
      ], questions: [
        { q: "What colour is the sun?", options: ["red", "blue", "green"], a: "red" }
      ] },
      bossExtra: [
        { type: "mc", q: "'The grass is ___ .'", options: ["green", "red", "black"], a: "green" }
      ]
    }
  ]
},

/* ================= 教材 3：牛津树 Oxford Reading Tree（阅读型·样例 3 单元） ================= */
{
  id: 3, name: "牛津树 Oxford Reading Tree", publisher: "Oxford University Press", grade: "分级阅读", color: "#c79a3a",
  desc: "全球最流行的英语分级阅读体系，以 Biff/Kipper 一家的故事学英语。",
  units: [
    {
      id: 1, name: "The Dog", biome: "小院故事", biomeEn: "Backyard Tale", icon: "🐕",
      mission: "Read the story and answer", missionZh: "读故事并回答",
      vocab: [
        { en: "dog", zh: "狗", ex: "Look at the dog.", tier: "common", icon: "🐕" },
        { en: "ball", zh: "球", ex: "The dog has a ball.", tier: "common", icon: "⚽" },
        { en: "run", zh: "跑", ex: "The dog can run.", tier: "core", icon: "🏃" },
        { en: "big", zh: "大的", ex: "A big dog.", tier: "common", icon: "🐘" },
        { en: "little", zh: "小的", ex: "A little dog.", tier: "core", icon: "🐶" },
        { en: "happy", zh: "开心的", ex: "The dog is happy.", tier: "challenge", icon: "😄" },
        { en: "look", zh: "看", ex: "Look at me.", tier: "common", icon: "👀" }
      ],
      grammar: [
        { name: "The dog can...", point: "能力", tokens: ["The", "dog", "can", "run"], distract: ["is", "are"], explain: "狗能……" },
        { name: "Look at...", point: "看", tokens: ["Look", "at", "the", "dog"], distract: ["You", "Me"], explain: "看……" }
      ],
      npc: [
        { name: "Kipper", avatar: "🧒", intro: "读读我家狗狗的故事！", steps: [
          { say: "Look ___ the dog.", q: "选词填空", options: ["at", "is", "am"], a: "at" },
          { say: "The dog ___ run.", q: "选词填空", options: ["can", "is", "are"], a: "can" }
        ] }
      ],
      story: { title: "The Dog", icon: "🐕", paras: [
        "Look at the dog. The dog is big.",
        "The dog has a ball. The dog can run.",
        "The dog is happy. We are happy too."
      ], questions: [
        { q: "What does the dog have?", options: ["a ball", "a cat", "a book"], a: "a ball" },
        { q: "Can the dog run?", options: ["Yes", "No", "Maybe"], a: "Yes" }
      ] },
      bossExtra: [
        { type: "mc", q: "'Look ___ the dog.'", options: ["at", "is", "am"], a: "at" }
      ]
    },
    {
      id: 2, name: "A Present", biome: "礼物盒子", biomeEn: "The Gift", icon: "🎁",
      mission: "Read and find the present", missionZh: "读故事找礼物",
      vocab: [
        { en: "present", zh: "礼物", ex: "A present for you.", tier: "common", icon: "🎁" },
        { en: "box", zh: "盒子", ex: "Open the box.", tier: "common", icon: "📦" },
        { en: "book", zh: "书", ex: "A book in the box.", tier: "common", icon: "📘" },
        { en: "toy", zh: "玩具", ex: "A toy for the dog.", tier: "core", icon: "🧸" },
        { en: "open", zh: "打开", ex: "Open the box.", tier: "common", icon: "📭" },
        { en: "new", zh: "新的", ex: "A new book.", tier: "challenge", icon: "✨" }
      ],
      grammar: [
        { name: "Open the...", point: "指令", tokens: ["Open", "the", "box"], distract: ["You", "Me"], explain: "打开……" },
        { name: "A present for...", point: "给…的礼物", tokens: ["A", "present", "for", "you"], distract: ["me", "I"], explain: "给你的礼物" }
      ],
      npc: [
        { name: "Biff", avatar: "👧", intro: "帮我拆礼物吧！", steps: [
          { say: "___ the box.", q: "选词填空", options: ["Open", "Close", "Look"], a: "Open" },
          { say: "A present ___ you.", q: "选词填空", options: ["for", "of", "is"], a: "for" }
        ] }
      ],
      story: { title: "A Present", icon: "🎁", paras: [
        "Mum has a box. 'A present for you,' she says.",
        "Open the box! A new book and a toy.",
        "Thank you, Mum! We are happy."
      ], questions: [
        { q: "What is in the box?", options: ["a book and a toy", "a dog", "a cat"], a: "a book and a toy" }
      ] },
      bossExtra: [
        { type: "mc", q: "'___ the box.'", options: ["Open", "Close", "Look"], a: "Open" }
      ]
    },
    {
      id: 3, name: "The Rope", biome: "绳子游戏", biomeEn: "The Rope Game", icon: "🪢",
      mission: "Read and play", missionZh: "读故事做游戏",
      vocab: [
        { en: "rope", zh: "绳子", ex: "A long rope.", tier: "common", icon: "🪢" },
        { en: "long", zh: "长的", ex: "A long rope.", tier: "core", icon: "📏" },
        { en: "skip", zh: "跳绳", ex: "Let us skip.", tier: "challenge", icon: "🤾" },
        { en: "play", zh: "玩", ex: "Let us play.", tier: "common", icon: "🎮" },
        { en: "fun", zh: "有趣", ex: "It is fun.", tier: "core", icon: "😄" }
      ],
      grammar: [
        { name: "Let us...", point: "一起做", tokens: ["Let", "us", "play"], distract: ["Me", "You"], explain: "我们一起……" },
        { name: "It is fun", point: "有趣", tokens: ["It", "is", "fun"], distract: ["am", "are"], explain: "真好玩" }
      ],
      npc: [
        { name: "Chip", avatar: "🧒", intro: "一起跳绳吧！", steps: [
          { say: "Let ___ play.", q: "选词填空", options: ["us", "me", "you"], a: "us" },
          { say: "It ___ fun.", q: "选词填空", options: ["is", "am", "are"], a: "is" }
        ] }
      ],
      story: { title: "The Rope", icon: "🪢", paras: [
        "Dad has a long rope. 'Let us skip!' he says.",
        "We skip and play. It is fun!",
        "Mum laughs. The dog laughs too."
      ], questions: [
        { q: "What do they do?", options: ["skip and play", "read a book", "sleep"], a: "skip and play" }
      ] },
      bossExtra: [
        { type: "mc", q: "'Let ___ skip.'", options: ["us", "me", "you"], a: "us" }
      ]
    }
  ]
},

/* ================= 教材 4：Kid's Box（剑桥·样例 3 单元） ================= */
{
  id: 4, name: "Kid's Box Starter", publisher: "Cambridge", grade: "启蒙", color: "#3a9bdc",
  desc: "剑桥少儿英语启蒙教材，歌曲游戏多，适合低龄启蒙。",
  units: [
    {
      id: 1, name: "Hello!", biome: "笑脸乐园", biomeEn: "Smiley Land", icon: "😄",
      mission: "Say hello and count", missionZh: "打招呼并数数",
      vocab: [
        { en: "hello", zh: "你好", ex: "Hello, Star!", tier: "common", icon: "👋" },
        { en: "goodbye", zh: "再见", ex: "Goodbye, friends!", tier: "common", icon: "🙋" },
        { en: "one", zh: "一", ex: "One star.", tier: "common", icon: "1️⃣" },
        { en: "two", zh: "二", ex: "Two stars.", tier: "common", icon: "2️⃣" },
        { en: "three", zh: "三", ex: "Three stars.", tier: "common", icon: "3️⃣" },
        { en: "star", zh: "星星", ex: "A yellow star.", tier: "core", icon: "⭐" },
        { en: "happy", zh: "开心的", ex: "I am happy.", tier: "challenge", icon: "😄" }
      ],
      grammar: [
        { name: "Hello / Goodbye", point: "问候", tokens: ["Hello", "Star"], distract: ["Good", "Bye"], explain: "你好 / 再见" },
        { name: "I am happy", point: "感受", tokens: ["I", "am", "happy"], distract: ["is", "are"], explain: "我很开心" }
      ],
      npc: [
        { name: "Maskman", avatar: "🦸", intro: "Hello! Let us count stars!", steps: [
          { say: "___ , Star!", q: "选词填空", options: ["Hello", "Bye", "Cat"], a: "Hello" },
          { say: "I am ___ .", q: "选词填空", options: ["happy", "cat", "red"], a: "happy" }
        ] }
      ],
      story: { title: "Star Count", icon: "⭐", paras: [
        "Hello! One star, two stars, three stars.",
        "The stars are yellow. I am happy.",
        "Goodbye, stars! See you tomorrow."
      ], questions: [
        { q: "How many stars?", options: ["three", "one", "five"], a: "three" }
      ] },
      bossExtra: [
        { type: "mc", q: "'I am ___ .'", options: ["happy", "cat", "red"], a: "happy" }
      ]
    },
    {
      id: 2, name: "My things", biome: "玩具箱", biomeEn: "Toy Box", icon: "🧸",
      mission: "Name your toys", missionZh: "说出玩具名称",
      vocab: [
        { en: "ball", zh: "球", ex: "A blue ball.", tier: "common", icon: "⚽" },
        { en: "doll", zh: "娃娃", ex: "A little doll.", tier: "common", icon: "🪆" },
        { en: "car", zh: "车", ex: "A red car.", tier: "common", icon: "🚗" },
        { en: "book", zh: "书", ex: "A green book.", tier: "core", icon: "📘" },
        { en: "toy", zh: "玩具", ex: "My favourite toy.", tier: "core", icon: "🧸" },
        { en: "red", zh: "红色", ex: "A red car.", tier: "common", icon: "🔴" }
      ],
      grammar: [
        { name: "It is a...", point: "它是", tokens: ["It", "is", "a", "ball"], distract: ["am", "are"], explain: "它是……" },
        { name: "My favourite...", point: "最喜欢的", tokens: ["My", "favourite", "toy"], distract: ["me", "I"], explain: "我最喜欢的……" }
      ],
      npc: [
        { name: "Trevor", avatar: "🐻", intro: "看看我的玩具箱！", steps: [
          { say: "It is a red ___ .", q: "选词填空", options: ["car", "cat", "book"], a: "car" },
          { say: "My favourite ___ is a doll.", q: "选词填空", options: ["toy", "red", "star"], a: "toy" }
        ] }
      ],
      story: { title: "Toy Box", icon: "🧸", paras: [
        "In my toy box: a ball, a doll, a car and a book.",
        "The car is red. The doll is little.",
        "My favourite toy is the ball!"
      ], questions: [
        { q: "What colour is the car?", options: ["red", "blue", "green"], a: "red" }
      ] },
      bossExtra: [
        { type: "mc", q: "'It is a ___ .'", options: ["ball", "red", "cat"], a: "ball" }
      ]
    },
    {
      id: 3, name: "My family", biome: "家庭树", biomeEn: "Family Tree", icon: "👨‍👩‍👧",
      mission: "Name family members", missionZh: "说出家庭成员",
      vocab: [
        { en: "mum", zh: "妈妈", ex: "This is my mum.", tier: "common", icon: "👩" },
        { en: "dad", zh: "爸爸", ex: "This is my dad.", tier: "common", icon: "👨" },
        { en: "brother", zh: "兄弟", ex: "My little brother.", tier: "core", icon: "👦" },
        { en: "sister", zh: "姐妹", ex: "My big sister.", tier: "core", icon: "👧" },
        { en: "friend", zh: "朋友", ex: "He is my friend.", tier: "common", icon: "🤝" },
        { en: "family", zh: "家庭", ex: "I love my family.", tier: "challenge", icon: "👨‍👩‍👧" }
      ],
      grammar: [
        { name: "This is my...", point: "介绍家人", tokens: ["This", "is", "my", "mum"], distract: ["am", "are"], explain: "这是我的……" },
        { name: "I love...", point: "爱", tokens: ["I", "love", "my", "family"], distract: ["am", "is"], explain: "我爱……" }
      ],
      npc: [
        { name: "Monty", avatar: "🐱", intro: "来认识我的家人！", steps: [
          { say: "This is my ___ .", q: "选词填空", options: ["dad", "red", "book"], a: "dad" },
          { say: "I ___ my family.", q: "选词填空", options: ["love", "am", "is"], a: "love" }
        ] }
      ],
      story: { title: "My Family", icon: "👨‍👩‍👧", paras: [
        "This is my mum. This is my dad.",
        "This is my brother. This is my sister.",
        "I love my family. We are happy."
      ], questions: [
        { q: "Who is in the family?", options: ["mum, dad, brother, sister", "a cat", "a book"], a: "mum, dad, brother, sister" }
      ] },
      bossExtra: [
        { type: "mc", q: "'This is my ___ .'", options: ["sister", "red", "ball"], a: "sister" }
      ]
    }
  ]
},

/* ================= 教材 5：典范英语 Good English（样例 2 单元） ================= */
{
  id: 5, name: "典范英语 Good English", publisher: "牛津·典范", grade: "分级阅读", color: "#8a5a2b",
  desc: "以原版故事分级阅读为主，语感地道，适合搭配课内教材拓展。",
  units: [
    {
      id: 1, name: "The Street Fair", biome: "街头集市", biomeEn: "Street Fair", icon: "🎪",
      mission: "Read the fair story", missionZh: "读集市故事",
      vocab: [
        { en: "fair", zh: "集市", ex: "A big street fair.", tier: "common", icon: "🎪" },
        { en: "balloon", zh: "气球", ex: "Red balloons!", tier: "common", icon: "🎈" },
        { en: "ice cream", zh: "冰淇淋", ex: "An ice cream, please.", tier: "core", icon: "🍦" },
        { en: "sell", zh: "卖", ex: "They sell toys.", tier: "challenge", icon: "💰" },
        { en: "song", zh: "歌", ex: "We sing a song.", tier: "core", icon: "🎵" },
        { en: "happy", zh: "开心的", ex: "Everyone is happy.", tier: "common", icon: "😄" }
      ],
      grammar: [
        { name: "They sell...", point: "他们卖", tokens: ["They", "sell", "toys"], distract: ["is", "are"], explain: "他们卖……" },
        { name: "We sing...", point: "我们唱", tokens: ["We", "sing", "a", "song"], distract: ["am", "is"], explain: "我们唱……" }
      ],
      npc: [
        { name: "摊主 Ben", avatar: "🧑", intro: "集市开张啦！", steps: [
          { say: "They ___ toys.", q: "选词填空", options: ["sell", "is", "are"], a: "sell" },
          { say: "We ___ a song.", q: "选词填空", options: ["sing", "am", "is"], a: "sing" }
        ] }
      ],
      story: { title: "The Street Fair", icon: "🎪", paras: [
        "It is a street fair! Red balloons in the sky.",
        "They sell toys and ice cream. We sing a song.",
        "Everyone is happy at the fair."
      ], questions: [
        { q: "What do they sell?", options: ["toys and ice cream", "a cat", "a book"], a: "toys and ice cream" }
      ] },
      bossExtra: [
        { type: "mc", q: "'We ___ a song.'", options: ["sing", "is", "are"], a: "sing" }
      ]
    },
    {
      id: 2, name: "The Pancake", biome: "早餐厨房", biomeEn: "Pancake Day", icon: "🥞",
      mission: "Read the pancake story", missionZh: "读煎饼故事",
      vocab: [
        { en: "pancake", zh: "煎饼", ex: "A hot pancake.", tier: "common", icon: "🥞" },
        { en: "eat", zh: "吃", ex: "Let us eat!", tier: "common", icon: "😋" },
        { en: "hot", zh: "热的", ex: "The pancake is hot.", tier: "core", icon: "🔥" },
        { en: "yummy", zh: "好吃的", ex: "It is yummy!", tier: "challenge", icon: "😋" },
        { en: "plate", zh: "盘子", ex: "On the plate.", tier: "core", icon: "🍽️" }
      ],
      grammar: [
        { name: "Let us...", point: "一起做", tokens: ["Let", "us", "eat"], distract: ["Me", "You"], explain: "我们一起……" },
        { name: "It is...", point: "它是", tokens: ["It", "is", "hot"], distract: ["am", "are"], explain: "它是……" }
      ],
      npc: [
        { name: "厨师 Mum", avatar: "👩‍🍳", intro: "煎饼做好啦！", steps: [
          { say: "Let ___ eat!", q: "选词填空", options: ["us", "me", "you"], a: "us" },
          { say: "The pancake ___ hot.", q: "选词填空", options: ["is", "am", "are"], a: "is" }
        ] }
      ],
      story: { title: "The Pancake", icon: "🥞", paras: [
        "Mum makes a pancake. It is hot and yummy.",
        "On the plate, the pancake smells good.",
        "Let us eat! We love pancake day."
      ], questions: [
        { q: "Where is the pancake?", options: ["on the plate", "in the book", "on the cat"], a: "on the plate" }
      ] },
      bossExtra: [
        { type: "mc", q: "'Let ___ eat!'", options: ["us", "me", "you"], a: "us" }
      ]
    }
  ]
}
];

/* ---------- 全局 UNITS：被选中教材动态填充 ---------- */
var UNITS = [];
function selectBook(i) {
  Cur.bookId = i;
  UNITS.length = 0;
  const tb = TEXTBOOKS[i];
  const units = (tb && typeof tb.units === 'function') ? tb.units() : (tb ? tb.units : []);
  units.forEach(u => UNITS.push(u));
  Save.save();
}
function getBook() { return TEXTBOOKS[Cur.bookId]; }
