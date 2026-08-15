/* ============================================================
   EduQuest · catalog.js
   生成式教材库：按「系列 × 年级」自动生成单元，覆盖小学主流教材全系列全年级。
   - 词库 WB（按主题）/ 语法库 GRAMMAR（按难度 band A/B/C）
   - 确定性种子（bookId+年级+单元），保证每次生成同一套词，存档进度稳定
   - 单元结构与原 handcrafted 完全一致：vocab/grammar/npc/story/bossExtra
   加载顺序：textbooks.js 之后。本文件向全局 TEXTBOOKS 追加条目。
   ============================================================ */
'use strict';

(function () {

  /* ---------- 确定性随机 ---------- */
  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function rngFor(bookId, gi, ui) { return mulberry32(hashStr(bookId + '|' + gi + '|' + ui)); }
  function shuf(arr, rng) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pickN(arr, n, rng) { return shuf(arr, rng).slice(0, n); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ---------- 主题词库 WB ---------- */
  const W = (en, zh, ex, icon, tier) => ({ en, zh, ex, icon, tier: tier || 'common' });
  const WB = {
    greet: [W('hello', '你好', 'Hello, my friend!', '👋'), W('hi', '嗨', 'Hi there!', '🙋'), W('goodbye', '再见', 'Goodbye, see you!', '👋'), W('thanks', '谢谢', 'Thanks for help!', '🙏'), W('please', '请', 'Please sit down.', '🤲'), W('sorry', '对不起', 'Sorry, my bad.', '😟'), W('good morning', '早上好', 'Good morning, class!', '🌅'), W('good night', '晚安', 'Good night, moon.', '🌙'), W('yes', '是', 'Yes, I can.', '✅'), W('no', '不', 'No, thank you.', '❌')],
    number: [W('one', '一', 'I have one cat.', '1️⃣'), W('two', '二', 'Two dogs run.', '2️⃣'), W('three', '三', 'Three red apples.', '3️⃣'), W('four', '四', 'Four blue birds.', '4️⃣'), W('five', '五', 'Five little ducks.', '5️⃣'), W('six', '六', 'Six green trees.', '6️⃣'), W('seven', '七', 'Seven stars shine.', '7️⃣'), W('eight', '八', 'Eight white eggs.', '8️⃣'), W('nine', '九', 'Nine toy cars.', '9️⃣'), W('ten', '十', 'Ten pink flowers.', '🔟'), W('eleven', '十一', 'Eleven small fish.', '🔢'), W('twelve', '十二', 'Twelve big books.', '🔢'), W('twenty', '二十', 'Twenty happy kids.', '🔢'), W('hundred', '百', 'One hundred stars.', '💯')],
    color: [W('red', '红色', 'The apple is red.', '🔴'), W('blue', '蓝色', 'The sky is blue.', '🔵'), W('yellow', '黄色', 'A yellow sun.', '🟡'), W('green', '绿色', 'Green grass grows.', '🟢'), W('orange', '橙色', 'An orange ball.', '🟠'), W('purple', '紫色', 'A purple grape.', '🟣'), W('pink', '粉色', 'A pink flower.', '🌸'), W('black', '黑色', 'Black night sky.', '⚫'), W('white', '白色', 'White snow falls.', '⚪'), W('brown', '棕色', 'Brown bear sleeps.', '🐻')],
    animal: [W('cat', '猫', 'The cat is small.', '🐱'), W('dog', '狗', 'A friendly dog.', '🐶'), W('fish', '鱼', 'The fish can swim.', '🐟'), W('bird', '鸟', 'A little bird sings.', '🐦'), W('rabbit', '兔子', 'The rabbit hops.', '🐰'), W('pig', '猪', 'The pig is pink.', '🐷'), W('cow', '牛', 'The cow gives milk.', '🐮'), W('duck', '鸭子', 'The duck says quack.', '🦆'), W('horse', '马', 'The horse runs fast.', '🐴'), W('sheep', '羊', 'The sheep is white.', '🐑'), W('elephant', '大象', 'The elephant is big.', '🐘'), W('lion', '狮子', 'The lion is king.', '🦁'), W('tiger', '老虎', 'The tiger is orange.', '🐯'), W('bear', '熊', 'The bear loves honey.', '🐻'), W('monkey', '猴子', 'The monkey climbs.', '🐵'), W('panda', '熊猫', 'The panda eats bamboo.', '🐼'), W('fox', '狐狸', 'The fox is clever.', '🦊'), W('frog', '青蛙', 'The frog jumps.', '🐸')],
    fruit: [W('apple', '苹果', 'A red apple.', '🍎'), W('banana', '香蕉', 'A yellow banana.', '🍌'), W('orange', '橙子', 'An orange orange.', '🍊'), W('grape', '葡萄', 'Purple grapes.', '🍇'), W('pear', '梨', 'A green pear.', '🍐'), W('peach', '桃', 'A sweet peach.', '🍑'), W('watermelon', '西瓜', 'A big watermelon.', '🍉'), W('strawberry', '草莓', 'Red strawberries.', '🍓'), W('mango', '芒果', 'A yellow mango.', '🥭'), W('lemon', '柠檬', 'A sour lemon.', '🍋')],
    food: [W('egg', '鸡蛋', 'I eat an egg.', '🥚'), W('rice', '米饭', 'We eat rice.', '🍚'), W('bread', '面包', 'Brown bread.', '🍞'), W('noodle', '面条', 'Hot noodles.', '🍜'), W('meat', '肉', 'The meat is red.', '🍖'), W('cake', '蛋糕', 'A birthday cake.', '🍰'), W('milk', '牛奶', 'Cold milk.', '🥛'), W('water', '水', 'Drink water.', '💧'), W('juice', '果汁', 'Apple juice.', '🧃'), W('cookie', '饼干', 'A sweet cookie.', '🍪'), W('hamburger', '汉堡', 'A big hamburger.', '🍔'), W('pizza', '披萨', 'A hot pizza.', '🍕'), W('ice cream', '冰淇淋', 'Ice cream is cold.', '🍦'), W('cheese', '奶酪', 'Yellow cheese.', '🧀')],
    body: [W('head', '头', 'I shake my head.', '🙆'), W('eye', '眼睛', 'Two blue eyes.', '👀'), W('ear', '耳朵', 'Small ears.', '👂'), W('nose', '鼻子', 'A little nose.', '👃'), W('mouth', '嘴巴', 'Open your mouth.', '👄'), W('hand', '手', 'Wash your hand.', '✋'), W('foot', '脚', 'One left foot.', '🦶'), W('arm', '手臂', 'Long arms.', '💪'), W('leg', '腿', 'Strong legs.', '🦵'), W('face', '脸', 'A happy face.', '😊'), W('hair', '头发', 'Black hair.', '💇'), W('tooth', '牙齿', 'White teeth.', '🦷')],
    family: [W('father', '爸爸', 'My father is tall.', '👨'), W('mother', '妈妈', 'My mother cooks.', '👩'), W('brother', '兄弟', 'My brother runs.', '👦'), W('sister', '姐妹', 'My sister sings.', '👧'), W('grandpa', '爷爷', 'Grandpa is old.', '👴'), W('grandma', '奶奶', 'Grandma bakes.', '👵'), W('baby', '婴儿', 'The baby cries.', '👶'), W('family', '家庭', 'I love my family.', '👪'), W('uncle', '叔叔', 'Uncle is funny.', '🧔'), W('aunt', '阿姨', 'Aunt is kind.', '👩‍🦰')],
    school: [W('book', '书', 'A big book.', '📕'), W('pen', '钢笔', 'A blue pen.', '🖊️'), W('pencil', '铅笔', 'A red pencil.', '✏️'), W('ruler', '尺子', 'A long ruler.', '📏'), W('bag', '书包', 'My school bag.', '🎒'), W('desk', '书桌', 'A clean desk.', '🪑'), W('chair', '椅子', 'Sit on the chair.', '🪑'), W('teacher', '老师', 'The teacher smiles.', '🧑‍🏫'), W('student', '学生', 'A good student.', '🧑‍🎓'), W('school', '学校', 'I like school.', '🏫'), W('blackboard', '黑板', 'Write on the board.', '🟫'), W('eraser', '橡皮', 'A pink eraser.', '🩹')],
    toy: [W('ball', '球', 'Kick the ball.', '⚽'), W('doll', '娃娃', 'A pretty doll.', '🪆'), W('car', '小汽车', 'A red car.', '🚗'), W('kite', '风筝', 'Fly the kite.', '🪁'), W('block', '积木', 'Build with blocks.', '🧱'), W('teddy', '泰迪熊', 'My teddy bear.', '🧸'), W('puzzle', '拼图', 'A hard puzzle.', '🧩'), W('robot', '机器人', 'A smart robot.', '🤖'), W('train', '火车', 'The train is long.', '🚂'), W('plane', '飞机', 'A white plane.', '✈️')],
    cloth: [W('shirt', '衬衫', 'A white shirt.', '👔'), W('dress', '连衣裙', 'A red dress.', '👗'), W('pants', '裤子', 'Blue pants.', '👖'), W('shoe', '鞋', 'New shoes.', '👟'), W('hat', '帽子', 'A warm hat.', '🎩'), W('sock', '袜子', 'Two socks.', '🧦'), W('coat', '外套', 'A thick coat.', '🧥'), W('skirt', '裙子', 'A short skirt.', '👚'), W('glove', '手套', 'Warm gloves.', '🧤'), W('scarf', '围巾', 'A long scarf.', '🧣')],
    weather: [W('sun', '太阳', 'The sun is hot.', '☀️'), W('rain', '雨', 'The rain falls.', '🌧️'), W('snow', '雪', 'White snow.', '❄️'), W('wind', '风', 'The wind blows.', '🌬️'), W('cloud', '云', 'A white cloud.', '☁️'), W('storm', '暴风雨', 'A big storm.', '⛈️'), W('fog', '雾', 'Thick fog.', '🌫️'), W('rainbow', '彩虹', 'A pretty rainbow.', '🌈')],
    season: [W('spring', '春天', 'Spring is green.', '🌱'), W('summer', '夏天', 'Summer is hot.', '🌞'), W('autumn', '秋天', 'Autumn is gold.', '🍂'), W('winter', '冬天', 'Winter is cold.', '⛄')],
    place: [W('in', '在…里', 'The cat is in the box.', '📦'), W('on', '在…上', 'The book is on the desk.', '⬆️'), W('under', '在…下', 'The ball is under the bed.', '⬇️'), W('behind', '在…后', 'The dog is behind the tree.', '🔙'), W('between', '在…之间', 'I sit between Mom and Dad.', '↔️'), W('near', '在…附近', 'The school is near my home.', '📍'), W('far', '远的', 'The moon is far.', '🌕'), W('front', '前面', 'Stand in front of me.', '🙆')],
    shape: [W('circle', '圆', 'A round circle.', '⭕'), W('square', '正方形', 'A red square.', '⬛'), W('triangle', '三角形', 'A blue triangle.', '🔺'), W('star', '星星', 'A yellow star.', '⭐'), W('heart', '心形', 'A pink heart.', '❤️'), W('line', '线', 'Draw a long line.', '➖'), W('rectangle', '长方形', 'A green rectangle.', '🟩'), W('oval', '椭圆', 'An oval egg.', '🥚')],
    vehicle: [W('bus', '公交车', 'The bus is yellow.', '🚌'), W('bike', '自行车', 'Ride a bike.', '🚲'), W('train', '火车', 'The train is fast.', '🚆'), W('plane', '飞机', 'Fly a plane.', '✈️'), W('ship', '轮船', 'A big ship.', '🚢'), W('boat', '小船', 'A small boat.', '⛵'), W('taxi', '出租车', 'A red taxi.', '🚕'), W('subway', '地铁', 'Take the subway.', '🚇'), W('rocket', '火箭', 'A tall rocket.', '🚀')],
    room: [W('bed', '床', 'Sleep in the bed.', '🛏️'), W('door', '门', 'Open the door.', '🚪'), W('window', '窗户', 'Clean the window.', '🪟'), W('table', '桌子', 'A round table.', '🪑'), W('lamp', '灯', 'A warm lamp.', '💡'), W('box', '盒子', 'A big box.', '📦'), W('sofa', '沙发', 'Sit on the sofa.', '🛋️'), W('clock', '钟', 'The clock is slow.', '🕰️'), W('fridge', '冰箱', 'Cold fridge.', '🧊')],
    sport: [W('run', '跑', 'I run fast.', '🏃'), W('jump', '跳', 'The frog can jump.', '🦘'), W('swim', '游泳', 'Fish can swim.', '🏊'), W('sing', '唱歌', 'She can sing.', '🎤'), W('dance', '跳舞', 'We dance happy.', '💃'), W('draw', '画画', 'I draw a cat.', '🎨'), W('read', '阅读', 'Read a book.', '📖'), W('write', '写', 'Write your name.', '✍️'), W('football', '足球', 'Kick the football.', '⚽'), W('basketball', '篮球', 'Throw the basketball.', '🏀'), W('ride', '骑', 'Ride a bike.', '🚴')],
    job: [W('doctor', '医生', 'The doctor helps.', '👨‍⚕️'), W('teacher', '老师', 'The teacher teaches.', '🧑‍🏫'), W('driver', '司机', 'The driver drives.', '🧑‍✈️'), W('farmer', '农民', 'The farmer grows rice.', '👨‍🌾'), W('nurse', '护士', 'The nurse is kind.', '👩‍⚕️'), W('cook', '厨师', 'The cook bakes.', '👨‍🍳'), W('police', '警察', 'The police helps.', '👮'), W('worker', '工人', 'The worker builds.', '👷'), W('artist', '画家', 'The artist draws.', '🎨'), W('scientist', '科学家', 'The scientist studies.', '🔬')],
    feeling: [W('happy', '开心', 'I am happy.', '😊'), W('sad', '伤心', 'The dog is sad.', '😢'), W('angry', '生气', 'Dad is angry.', '😠'), W('tired', '累', 'I am tired.', '😴'), W('hungry', '饿', 'The cat is hungry.', '🤤'), W('scared', '害怕', 'The baby is scared.', '😨'), W('love', '爱', 'I love my mom.', '🥰'), W('excited', '兴奋', 'We are excited.', '🤩'), W('bored', '无聊', 'He is bored.', '🥱')],
    time: [W('Monday', '星期一', 'Monday is blue.', '1️⃣'), W('Tuesday', '星期二', 'Tuesday is green.', '2️⃣'), W('Wednesday', '星期三', 'Wednesday is red.', '3️⃣'), W('Thursday', '星期四', 'Thursday is yellow.', '4️⃣'), W('Friday', '星期五', 'Friday is fun.', '5️⃣'), W('Saturday', '星期六', 'Saturday is free.', '6️⃣'), W('Sunday', '星期日', 'Sunday is calm.', '7️⃣'), W('morning', '早晨', 'Good morning!', '🌅'), W('evening', '晚上', 'Good evening!', '🌆'), W('today', '今天', 'Today is sunny.', '📅'), W('tomorrow', '明天', 'See you tomorrow.', '📆')],
    nature: [W('tree', '树', 'A tall tree.', '🌳'), W('flower', '花', 'A red flower.', '🌸'), W('grass', '草', 'Green grass.', '🌿'), W('river', '河', 'A long river.', '🏞️'), W('mountain', '山', 'A high mountain.', '⛰️'), W('moon', '月亮', 'The moon is bright.', '🌕'), W('star', '星星', 'A small star.', '⭐'), W('sky', '天空', 'The blue sky.', '🌌'), W('sea', '海', 'The big sea.', '🌊'), W('stone', '石头', 'A grey stone.', '🪨'), W('leaf', '叶子', 'A green leaf.', '🍃')],
    city: [W('shop', '商店', 'Go to the shop.', '🏪'), W('park', '公园', 'Play in the park.', '🏞️'), W('hospital', '医院', 'The hospital is white.', '🏥'), W('library', '图书馆', 'Read in the library.', '📚'), W('zoo', '动物园', 'See the zoo.', '🦁'), W('street', '街道', 'Walk on the street.', '🛣️'), W('house', '房子', 'A small house.', '🏠'), W('market', '市场', 'The market is busy.', '🏪'), W('bridge', '桥', 'Cross the bridge.', '🌉')],
    adj: [W('big', '大的', 'A big dog.', '🔶'), W('small', '小的', 'A small cat.', '🔹'), W('long', '长的', 'A long snake.', '📏'), W('short', '短的', 'A short pen.', '✂️'), W('new', '新的', 'A new book.', '🆕'), W('old', '旧的', 'An old chair.', '🪑'), W('fast', '快的', 'A fast car.', '💨'), W('slow', '慢的', 'A slow turtle.', '🐢'), W('clean', '干净的', 'A clean room.', '🧼'), W('dirty', '脏的', 'A dirty shoe.', '🩴'), W('hot', '热的', 'The soup is hot.', '🔥'), W('cold', '冷的', 'The ice is cold.', '🧊')]
  };

  const ALL = [];
  Object.values(WB).forEach(arr => arr.forEach(w => ALL.push(w)));
  const EN_LIST = ALL.map(w => w.en);

  /* ---------- 语法库 GRAMMAR（按 band） ---------- */
  const GRAMMAR = {
    A: [
      { name: 'a / an', point: '元音前用 an', tokens: ['I', 'have', 'an', 'egg'], distract: ['a', 'the'], explain: '元音音素开头的词前用 an' },
      { name: 'I am', point: 'be 动词', tokens: ['I', 'am', 'happy'], distract: ['is', 'are'], explain: '第一人称 I 用 am' },
      { name: 'This is', point: '介绍单数', tokens: ['This', 'is', 'a', 'cat'], distract: ['are', 'am'], explain: 'This is + 单数名词' },
      { name: 'I like', point: '喜欢…', tokens: ['I', 'like', 'dogs'], distract: ['likes', 'am'], explain: 'I like + 名词' },
      { name: 'can', point: '能力', tokens: ['I', 'can', 'run'], distract: ['am', 'do'], explain: 'can + 动词原形' },
      { name: 'have got', point: '拥有', tokens: ['I', 'have', 'got', 'a', 'book'], distract: ['has', 'am'], explain: 'I have got ...' },
      { name: 'It is', point: 'be 动词', tokens: ['It', 'is', 'red'], distract: ['am', 'are'], explain: '单数用 is' },
      { name: 'numbers', point: '数量', tokens: ['I', 'have', 'two', 'apples'], distract: ['one', 'three'], explain: '用数词表示数量' }
    ],
    B: [
      { name: 'there is', point: '某处有', tokens: ['There', 'is', 'a', 'dog'], distract: ['are', 'be'], explain: '单数用 there is' },
      { name: 'he plays', point: '第三人称单数', tokens: ['He', 'plays', 'football'], distract: ['play', 'playing'], explain: '第三人称单数动词加 s' },
      { name: 'like + ing', point: '爱好', tokens: ['She', 'likes', 'swimming'], distract: ['swim', 'to swim'], explain: 'like + 动词 -ing' },
      { name: 'went', point: '过去式', tokens: ['We', 'went', 'to', 'school'], distract: ['go', 'going'], explain: 'go 的过去式 went' },
      { name: 'under', point: '方位介词', tokens: ['The', 'cat', 'is', 'under', 'the', 'table'], distract: ['on', 'in'], explain: 'under 在…下面' },
      { name: 'smaller than', point: '比较级', tokens: ['A', 'cat', 'is', 'smaller', 'than', 'a', 'dog'], distract: ['small', 'smallest'], explain: '比较级 + than' },
      { name: 'they are', point: 'be 动词', tokens: ['They', 'are', 'happy'], distract: ['is', 'am'], explain: '复数用 are' },
      { name: 'can', point: '能力', tokens: ['He', 'can', 'swim'], distract: ['swims', 'am'], explain: 'can 后接动词原形' }
    ],
    C: [
      { name: 'will', point: '将来时', tokens: ['I', 'will', 'go', 'tomorrow'], distract: ['going', 'went'], explain: 'will + 动词原形' },
      { name: 'be going to', point: '计划', tokens: ['She', 'is', 'going', 'to', 'sing'], distract: ['will', 'sing'], explain: 'be going to 表计划' },
      { name: 'ate', point: '过去式', tokens: ['They', 'ate', 'an', 'apple'], distract: ['eat', 'eating'], explain: 'eat 的过去式 ate' },
      { name: 'the tallest', point: '最高级', tokens: ['He', 'is', 'the', 'tallest'], distract: ['taller', 'tall'], explain: '最高级前加 the' },
      { name: 'should', point: '建议', tokens: ['You', 'should', 'study'], distract: ['must', 'studying'], explain: 'should 表建议' },
      { name: 'and', point: '并列连词', tokens: ['I', 'like', 'apples', 'and', 'oranges'], distract: ['but', 'because'], explain: 'and 连接并列' },
      { name: 'has got', point: '拥有', tokens: ['He', 'has', 'got', 'a', 'car'], distract: ['have', 'is'], explain: '第三人称用 has got' },
      { name: 'because', point: '原因', tokens: ['I', 'am', 'happy', 'because', 'it', 'is', 'sunny'], distract: ['but', 'and'], explain: 'because 表原因' }
    ]
  };

  /* ---------- 单元生成 ---------- */
  const TOPICS_BY_BAND = {
    A: ['greet', 'number', 'color', 'animal', 'fruit', 'food', 'body', 'family', 'toy', 'school'],
    B: ['animal', 'fruit', 'food', 'cloth', 'weather', 'season', 'place', 'shape', 'vehicle', 'room', 'sport', 'school', 'body', 'color'],
    C: ['animal', 'food', 'cloth', 'weather', 'vehicle', 'room', 'sport', 'job', 'feeling', 'time', 'nature', 'city', 'adj', 'place', 'fruit']
  };
  const BIOMES = [['🏜️', '沙漠绿洲'], ['🌳', '丛林秘境'], ['🏔️', '雪山脚'], ['🌊', '珊瑚海湾'], ['🌋', '熔岩荒原'], ['🏰', '城堡庭院'], ['🌌', '星空站台'], ['🍎', '果园小径'], ['🏘️', '温馨小镇'], ['⚓', '港湾码头'], ['🕳️', '水晶洞窟'], ['🌾', '金色麦田']];
  const NPC_NAMES = [['🧔', '站长 Omar'], ['👩‍🦱', '旅行家 Aisha'], ['👩‍🌾', '护林员 Ruby'], ['🧑‍🚀', '探险家 Max'], ['👨‍✈️', '船长 Leo'], ['👩‍🍳', '厨师 Mia'], ['🧑‍🏫', '老师 Lily'], ['👨‍⚕️', '医生 Dan'], ['🕵️', '侦探 Kim'], ['🧑‍🚀', '宇航员 Neo']];
  const STORY_ICONS = ['🌟', '📖', '🗺️', '🔮', '🐉', '🚀'];

  function genVocab(band, rng) {
    const topics = TOPICS_BY_BAND[band] || TOPICS_BY_BAND.B;
    const chosen = pickN(topics, band === 'A' ? 3 : 4, rng);
    let words = [];
    chosen.forEach(t => { words = words.concat(WB[t] || []); });
    words = shuf(words, rng);
    const cap = band === 'A' ? 16 : (band === 'B' ? 18 : 20);
    if (words.length > cap) words = words.slice(0, cap);
    while (words.length < 8) words = words.concat(pickN(ALL, 8 - words.length, rng));
    return words;
  }

  function genGrammar(band, rng) {
    const pool = GRAMMAR[band] || GRAMMAR.B;
    return pickN(pool, 3 + Math.floor(rng() * 2), rng);
  }

  function makeCloze(g, rng) {
    // 找一个非 distract、且非首词的 token 作为空
    let keyIdx = -1;
    for (let i = g.tokens.length - 1; i >= 1; i--) {
      if (!g.distract.includes(g.tokens[i])) { keyIdx = i; break; }
    }
    if (keyIdx < 0) keyIdx = 1;
    const blanked = g.tokens.map((t, i) => i === keyIdx ? '＿＿＿' : t).join(' ');
    const opts = shuf([g.tokens[keyIdx]].concat(g.distract), rng).slice(0, 4);
    return { type: 'cloze', q: blanked, sub: g.explain, options: opts, a: g.tokens[keyIdx] };
  }

  function genNPC(band, rng, vocab) {
    const picks = pickN(NPC_NAMES, 2, rng);
    return picks.map(([avatar, name]) => {
      const steps = [];
      const n = 2 + Math.floor(rng() * 2); // 2~3 步
      for (let s = 0; s < n; s++) {
        if (rng() < 0.55 && vocab.length) {
          const v = vocab[Math.floor(rng() * vocab.length)];
          const others = pickN(EN_LIST.filter(e => e !== v.en), 3, rng);
          steps.push({ say: `Can you say 「${v.zh}」 in English?`, q: `「${v.zh}」用英语怎么说？`, options: shuf([v.en].concat(others), rng), a: v.en });
        } else {
          const g = (GRAMMAR[band] || GRAMMAR.B)[Math.floor(rng() * (GRAMMAR[band] || GRAMMAR.B).length)];
          const c = makeCloze(g, rng);
          steps.push({ say: `Fill the blank: ${c.q}`, q: '选词填空', options: c.options, a: c.a });
        }
      }
      return { name, avatar, intro: '帮我完成今天的英语小任务吧！', steps };
    });
  }

  function genStory(band, rng, vocab) {
    const tmpl = [
      ['Look at the {0}. The {1} is {2}. We eat {3} and drink {4}.', '我们的小伙伴'],
      ['I have a {0}. It is {1}. My {2} likes the {3}. We play with the {4}.', '我的宝贝'],
      ['The {0} is {1}. A {2} can {3}. We see a {4} at school.', '可爱的一天'],
      ['There is a {0} under the {1}. The {2} is smaller than the {3}. We go to {4}.', '寻宝记'],
      ['She likes {0}. He plays {1}. They are {2} because it is {3}. We see {4} in the park.', '好朋友'],
      ['I will go to the {0} tomorrow. He is the {1} in class. We should read {2}. Because it is {3}, we eat {4}.', '明天的计划']
    ][Math.floor(rng() * 6)];
    const slots = pickN(vocab, 5, rng).map(v => v.en);
    const paras = [tmpl[0].replace(/\{(\d)\}/g, (_, i) => slots[Number(i)] || 'something')];
    const icon = STORY_ICONS[Math.floor(rng() * STORY_ICONS.length)];
    const q1w = vocab[Math.floor(rng() * vocab.length)];
    const q2w = vocab[(vocab.indexOf(q1w) + 1) % vocab.length];
    const questions = [
      { q: `故事里出现了哪个词：「${q1w.zh}」？`, options: shuf([q1w.en].concat(pickN(EN_LIST.filter(e => e !== q1w.en), 3, rng)), rng), a: q1w.en },
      { q: `「${q2w.zh}」用英语怎么说？`, options: shuf([q2w.en].concat(pickN(EN_LIST.filter(e => e !== q2w.en), 3, rng)), rng), a: q2w.en }
    ];
    return { title: tmpl[1], icon, paras, questions };
  }

  function genBossExtra(band, rng, vocab) {
    const out = [];
    // 1 篇阅读
    const rv = pickN(vocab, 3, rng);
    const passage = `The ${rv[0].en} is ${rv[1].en}. We like ${rv[2].en}.`;
    out.push({ type: 'read', passage, q: `故事里我们喜欢什么？`, options: shuf([rv[2].en].concat(pickN(EN_LIST.filter(e => e !== rv[2].en), 2, rng)), rng), a: rv[2].en });
    // 1 道综合/语法
    const g = (GRAMMAR[band] || GRAMMAR.B)[Math.floor(rng() * (GRAMMAR[band] || GRAMMAR.B).length)];
    out.push(makeCloze(g, rng));
    return out;
  }

  function genUnit(bookId, label, gi, ui, band) {
    const rng = rngFor(bookId, gi, ui);
    const vocab = genVocab(band, rng);
    const grammar = genGrammar(band, rng);
    const biome = BIOMES[(gi + ui) % BIOMES.length];
    const missionZh = ['用英语完成本单元冒险', '收集单词，闯过试炼', '听读说，打好基础', '和小伙伴一起闯关', '在游戏里把英语学扎实'][(gi + ui) % 5];
    return {
      id: ui + 1,
      name: `Unit ${ui + 1} · ${label}`,
      biome: biome[1],
      biomeEn: 'Adventure',
      icon: biome[0],
      mission: 'Learn English by playing',
      missionZh,
      vocab,
      grammar,
      npc: genNPC(band, rng, vocab),
      story: genStory(band, rng, vocab),
      bossExtra: genBossExtra(band, rng, vocab)
    };
  }

  /* ---------- 系列注册 ---------- */
  function addSeries(opt) {
    const id = TEXTBOOKS.length;
    const perGrade = opt.perGrade || 3;
    TEXTBOOKS.push({
      id,
      name: opt.name,
      publisher: opt.publisher,
      color: opt.color,
      desc: opt.desc,
      unitCount: opt.grades.length * perGrade,
      _per: perGrade,
      _grades: opt.grades,
      _band: opt.bandOf,
      units() {
        if (this._u) return this._u;
        const arr = [];
        this._grades.forEach((g, gi) => {
          const band = this._band ? this._band(g, gi) : (gi < 2 ? 'A' : gi < 4 ? 'B' : 'C');
          for (let ui = 0; ui < this._per; ui++) arr.push(genUnit(this.id, g, gi, ui, band));
        });
        this._u = arr;
        return arr;
      }
    });
  }

  // 年级标签与难度映射
  const GRADES = {
    pep: ['三年级上', '三年级下', '四年级上', '四年级下', '五年级上', '五年级下', '六年级上', '六年级下'],
    pepBand: (g, gi) => (gi < 4 ? 'B' : 'C'),
    waiLow: ['一年级上', '一年级下', '二年级上', '二年级下', '三年级上', '三年级下', '四年级上', '四年级下', '五年级上', '五年级下', '六年级上', '六年级下'],
    waiLowBand: (g, gi) => (gi < 2 ? 'A' : gi < 6 ? 'B' : 'C'),
    waiHigh: ['三年级上', '三年级下', '四年级上', '四年级下', '五年级上', '五年级下', '六年级上', '六年级下'],
    pu: ['Starter', '1', '2', '3', '5', '6'],
    puBand: (g, gi) => (gi < 3 ? 'A' : gi < 5 ? 'B' : 'C'),
    kb: ['1', '2', '3', '4', '5', '6'],
    kbBand: (g, gi) => (gi < 2 ? 'A' : gi < 4 ? 'B' : 'C'),
    ort: ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Stage 5', 'Stage 6', 'Stage 7', 'Stage 8', 'Stage 9'],
    ortBand: (g, gi) => (gi < 3 ? 'A' : gi < 6 ? 'B' : 'C'),
    good: ['2', '3', '4', '5', '6'],
    goodBand: (g, gi) => (gi < 2 ? 'A' : gi < 4 ? 'B' : 'C'),
    nc: ['1', '2', '3', '4'],
    ncBand: (g, gi) => (gi < 1 ? 'A' : gi < 2 ? 'B' : 'C'),
    ncj: ['1A', '1B', '2A', '2B', '3A', '3B'],
    ncjBand: (g, gi) => (gi < 2 ? 'A' : gi < 4 ? 'B' : 'C'),
    raz: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    razBand: (g, gi) => (gi < 3 ? 'A' : gi < 6 ? 'B' : 'C'),
    hei: ['GK', 'G1', 'G2'],
    heiBand: (g, gi) => (gi < 1 ? 'A' : gi < 2 ? 'B' : 'C'),
    cat: ['1', '2', '3', '4', '5', '6', '7'],
    catBand: (g, gi) => (gi < 2 ? 'A' : gi < 4 ? 'B' : 'C'),
    od: ['1', '2', '3', '4', '5', '6'],
    odBand: (g, gi) => (gi < 2 ? 'A' : gi < 4 ? 'B' : 'C'),
    sk: ['1', '2', '3', '4', '5', '6'],
    skBand: (g, gi) => (gi < 2 ? 'A' : gi < 4 ? 'B' : 'C'),
    xp: ['1', '2', '3', '4', '5', '6'],
    xpBand: (g, gi) => (gi < 2 ? 'A' : gi < 4 ? 'B' : 'C'),
    cye: ['Starter', 'Movers', 'Flyers'],
    cyeBand: (g, gi) => (gi < 1 ? 'A' : gi < 2 ? 'B' : 'C')
  };

  /* ===== 人教版系 / 外研社 / 地方版（PEP 体系全覆盖） ===== */
  addSeries({ name: '人教版 PEP · 三年级上', publisher: '人民教育出版社', color: '#c0392b', desc: '全国使用最广的小学英语教材，三年级起点。', grades: ['三年级上'], perGrade: 6, bandOf: GRADES.pepBand });
  addSeries({ name: '人教版 PEP · 三年级下', publisher: '人民教育出版社', color: '#c0392b', desc: 'PEP 三年级下，基础词汇与句型。', grades: ['三年级下'], perGrade: 6, bandOf: GRADES.pepBand });
  addSeries({ name: '人教版 PEP · 四年级上', publisher: '人民教育出版社', color: '#c0392b', desc: 'PEP 四年级上，话题更丰富。', grades: ['四年级上'], perGrade: 6, bandOf: GRADES.pepBand });
  addSeries({ name: '人教版 PEP · 四年级下', publisher: '人民教育出版社', color: '#c0392b', desc: 'PEP 四年级下，语法入门。', grades: ['四年级下'], perGrade: 6, bandOf: GRADES.pepBand });
  addSeries({ name: '人教版 PEP · 五年级上', publisher: '人民教育出版社', color: '#c0392b', desc: 'PEP 五年级上，阅读与写作起步。', grades: ['五年级上'], perGrade: 6, bandOf: GRADES.pepBand });
  addSeries({ name: '人教版 PEP · 五年级下', publisher: '人民教育出版社', color: '#c0392b', desc: 'PEP 五年级下，时态铺垫。', grades: ['五年级下'], perGrade: 6, bandOf: GRADES.pepBand });
  addSeries({ name: '人教版 PEP · 六年级上', publisher: '人民教育出版社', color: '#c0392b', desc: 'PEP 六年级上，综合提升。', grades: ['六年级上'], perGrade: 6, bandOf: GRADES.pepBand });
  addSeries({ name: '人教版 PEP · 六年级下', publisher: '人民教育出版社', color: '#c0392b', desc: 'PEP 六年级下，小升初衔接。', grades: ['六年级下'], perGrade: 6, bandOf: GRADES.pepBand });

  addSeries({ name: '外研社 新标准（一年级起点）· 一年级上', publisher: '外语教学与研究出版社', color: '#16a085', desc: '一年级起点，零基础启蒙。', grades: ['一年级上'], perGrade: 5, bandOf: GRADES.waiLowBand });
  addSeries({ name: '外研社 新标准（一年级起点）· 一年级下', publisher: '外语教学与研究出版社', color: '#16a085', desc: '一年级下，听说为主。', grades: ['一年级下'], perGrade: 5, bandOf: GRADES.waiLowBand });
  addSeries({ name: '外研社 新标准（一年级起点）· 二年级上', publisher: '外语教学与研究出版社', color: '#16a085', desc: '二年级上，自然拼读渗透。', grades: ['二年级上'], perGrade: 5, bandOf: GRADES.waiLowBand });
  addSeries({ name: '外研社 新标准（一年级起点）· 二年级下', publisher: '外语教学与研究出版社', color: '#16a085', desc: '二年级下，话题扩展。', grades: ['二年级下'], perGrade: 5, bandOf: GRADES.waiLowBand });
  addSeries({ name: '外研社 新标准（一年级起点）· 三年级上', publisher: '外语教学与研究出版社', color: '#16a085', desc: '三年级上，开始读写。', grades: ['三年级上'], perGrade: 5, bandOf: GRADES.waiLowBand });
  addSeries({ name: '外研社 新标准（一年级起点）· 三年级下', publisher: '外语教学与研究出版社', color: '#16a085', desc: '三年级下，句型进阶。', grades: ['三年级下'], perGrade: 5, bandOf: GRADES.waiLowBand });
  addSeries({ name: '外研社 新标准（一年级起点）· 四年级上', publisher: '外语教学与研究出版社', color: '#16a085', desc: '四年级上，语法系统。', grades: ['四年级上'], perGrade: 5, bandOf: GRADES.waiLowBand });
  addSeries({ name: '外研社 新标准（一年级起点）· 四年级下', publisher: '外语教学与研究出版社', color: '#16a085', desc: '四年级下，阅读加强。', grades: ['四年级下'], perGrade: 5, bandOf: GRADES.waiLowBand });
  addSeries({ name: '外研社 新标准（一年级起点）· 五年级上', publisher: '外语教学与研究出版社', color: '#16a085', desc: '五年级上，小语篇。', grades: ['五年级上'], perGrade: 5, bandOf: GRADES.waiLowBand });
  addSeries({ name: '外研社 新标准（一年级起点）· 五年级下', publisher: '外语教学与研究出版社', color: '#16a085', desc: '五年级下，时态进阶。', grades: ['五年级下'], perGrade: 5, bandOf: GRADES.waiLowBand });
  addSeries({ name: '外研社 新标准（一年级起点）· 六年级上', publisher: '外语教学与研究出版社', color: '#16a085', desc: '六年级上，综合语用。', grades: ['六年级上'], perGrade: 5, bandOf: GRADES.waiLowBand });
  addSeries({ name: '外研社 新标准（一年级起点）· 六年级下', publisher: '外语教学与研究出版社', color: '#16a085', desc: '六年级下，小升初冲刺。', grades: ['六年级下'], perGrade: 5, bandOf: GRADES.waiLowBand });

  addSeries({ name: '外研社 新标准（三年级起点）· 三年级上', publisher: '外语教学与研究出版社', color: '#1abc9c', desc: '三年级起点版本，全国多省市选用。', grades: ['三年级上'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '外研社 新标准（三年级起点）· 三年级下', publisher: '外语教学与研究出版社', color: '#1abc9c', desc: '三下，基础话题。', grades: ['三年级下'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '外研社 新标准（三年级起点）· 四年级上', publisher: '外语教学与研究出版社', color: '#1abc9c', desc: '四上，句型拓展。', grades: ['四年级上'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '外研社 新标准（三年级起点）· 四年级下', publisher: '外语教学与研究出版社', color: '#1abc9c', desc: '四下，语法铺垫。', grades: ['四年级下'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '外研社 新标准（三年级起点）· 五年级上', publisher: '外语教学与研究出版社', color: '#1abc9c', desc: '五上，阅读起步。', grades: ['五年级上'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '外研社 新标准（三年级起点）· 五年级下', publisher: '外语教学与研究出版社', color: '#1abc9c', desc: '五下，时态。', grades: ['五年级下'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '外研社 新标准（三年级起点）· 六年级上', publisher: '外语教学与研究出版社', color: '#1abc9c', desc: '六上，综合运用。', grades: ['六年级上'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '外研社 新标准（三年级起点）· 六年级下', publisher: '外语教学与研究出版社', color: '#1abc9c', desc: '六下，小升初。', grades: ['六年级下'], perGrade: 5, bandOf: GRADES.pepBand });

  addSeries({ name: '沪教牛津版 · 三年级上', publisher: '上海教育出版社·牛津', color: '#2980b9', desc: '沪教牛津，上海及多地选用。', grades: ['三年级上'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '沪教牛津版 · 三年级下', publisher: '上海教育出版社·牛津', color: '#2980b9', desc: '三下。', grades: ['三年级下'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '沪教牛津版 · 四年级上', publisher: '上海教育出版社·牛津', color: '#2980b9', desc: '四上。', grades: ['四年级上'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '沪教牛津版 · 四年级下', publisher: '上海教育出版社·牛津', color: '#2980b9', desc: '四下。', grades: ['四年级下'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '沪教牛津版 · 五年级上', publisher: '上海教育出版社·牛津', color: '#2980b9', desc: '五上。', grades: ['五年级上'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '沪教牛津版 · 五年级下', publisher: '上海教育出版社·牛津', color: '#2980b9', desc: '五下。', grades: ['五年级下'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '沪教牛津版 · 六年级上', publisher: '上海教育出版社·牛津', color: '#2980b9', desc: '六上。', grades: ['六年级上'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '沪教牛津版 · 六年级下', publisher: '上海教育出版社·牛津', color: '#2980b9', desc: '六下。', grades: ['六年级下'], perGrade: 5, bandOf: GRADES.pepBand });

  addSeries({ name: '北师大版 · 三年级上', publisher: '北京师范大学出版社', color: '#8e44ad', desc: '北师大版小学英语，三年级起点。', grades: ['三年级上'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '北师大版 · 三年级下', publisher: '北京师范大学出版社', color: '#8e44ad', desc: '三下。', grades: ['三年级下'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '北师大版 · 四年级上', publisher: '北京师范大学出版社', color: '#8e44ad', desc: '四上。', grades: ['四年级上'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '北师大版 · 四年级下', publisher: '北京师范大学出版社', color: '#8e44ad', desc: '四下。', grades: ['四年级下'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '北师大版 · 五年级上', publisher: '北京师范大学出版社', color: '#8e44ad', desc: '五上。', grades: ['五年级上'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '北师大版 · 五年级下', publisher: '北京师范大学出版社', color: '#8e44ad', desc: '五下。', grades: ['五年级下'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '北师大版 · 六年级上', publisher: '北京师范大学出版社', color: '#8e44ad', desc: '六上。', grades: ['六年级上'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '北师大版 · 六年级下', publisher: '北京师范大学出版社', color: '#8e44ad', desc: '六下。', grades: ['六年级下'], perGrade: 5, bandOf: GRADES.pepBand });

  addSeries({ name: '译林版（牛津译林）· 三年级上', publisher: '译林出版社·牛津', color: '#27ae60', desc: '译林牛津，江苏等地主流。', grades: ['三年级上'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '译林版（牛津译林）· 三年级下', publisher: '译林出版社·牛津', color: '#27ae60', desc: '三下。', grades: ['三年级下'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '译林版（牛津译林）· 四年级上', publisher: '译林出版社·牛津', color: '#27ae60', desc: '四上。', grades: ['四年级上'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '译林版（牛津译林）· 四年级下', publisher: '译林出版社·牛津', color: '#27ae60', desc: '四下。', grades: ['四年级下'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '译林版（牛津译林）· 五年级上', publisher: '译林出版社·牛津', color: '#27ae60', desc: '五上。', grades: ['五年级上'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '译林版（牛津译林）· 五年级下', publisher: '译林出版社·牛津', color: '#27ae60', desc: '五下。', grades: ['五年级下'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '译林版（牛津译林）· 六年级上', publisher: '译林出版社·牛津', color: '#27ae60', desc: '六上。', grades: ['六年级上'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '译林版（牛津译林）· 六年级下', publisher: '译林出版社·牛津', color: '#27ae60', desc: '六下。', grades: ['六年级下'], perGrade: 5, bandOf: GRADES.pepBand });

  addSeries({ name: '冀教版 · 三年级上', publisher: '河北教育出版社', color: '#d35400', desc: '冀教版小学英语，河北等地选用。', grades: ['三年级上'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '冀教版 · 三年级下', publisher: '河北教育出版社', color: '#d35400', desc: '三下。', grades: ['三年级下'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '冀教版 · 四年级上', publisher: '河北教育出版社', color: '#d35400', desc: '四上。', grades: ['四年级上'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '冀教版 · 四年级下', publisher: '河北教育出版社', color: '#d35400', desc: '四下。', grades: ['四年级下'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '冀教版 · 五年级上', publisher: '河北教育出版社', color: '#d35400', desc: '五上。', grades: ['五年级上'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '冀教版 · 五年级下', publisher: '河北教育出版社', color: '#d35400', desc: '五下。', grades: ['五年级下'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '冀教版 · 六年级上', publisher: '河北教育出版社', color: '#d35400', desc: '六上。', grades: ['六年级上'], perGrade: 5, bandOf: GRADES.pepBand });
  addSeries({ name: '冀教版 · 六年级下', publisher: '河北教育出版社', color: '#d35400', desc: '六下。', grades: ['六年级下'], perGrade: 5, bandOf: GRADES.pepBand });

  /* ===== 剑桥 / 牛津国际系 ===== */
  addSeries({ name: 'Power Up · Starter', publisher: 'Cambridge', color: '#7b5cff', desc: '剑桥考级体系，零基础启蒙。', grades: ['Starter'], perGrade: 6, bandOf: GRADES.puBand });
  addSeries({ name: 'Power Up · 1', publisher: 'Cambridge', color: '#7b5cff', desc: 'Power Up 1，YLE 衔接。', grades: ['1'], perGrade: 6, bandOf: GRADES.puBand });
  addSeries({ name: 'Power Up · 2', publisher: 'Cambridge', color: '#7b5cff', desc: 'Power Up 2。', grades: ['2'], perGrade: 6, bandOf: GRADES.puBand });
  addSeries({ name: 'Power Up · 3', publisher: 'Cambridge', color: '#7b5cff', desc: 'Power Up 3。', grades: ['3'], perGrade: 6, bandOf: GRADES.puBand });
  addSeries({ name: 'Power Up · 5', publisher: 'Cambridge', color: '#7b5cff', desc: 'Power Up 5，KET 铺垫。', grades: ['5'], perGrade: 6, bandOf: GRADES.puBand });
  addSeries({ name: 'Power Up · 6', publisher: 'Cambridge', color: '#7b5cff', desc: 'Power Up 6，KET 冲刺。', grades: ['6'], perGrade: 6, bandOf: GRADES.puBand });

  addSeries({ name: "Kid's Box · 1", publisher: 'Cambridge', color: '#9b59b6', desc: '剑桥人气少儿教材 KB1。', grades: ['1'], perGrade: 6, bandOf: GRADES.kbBand });
  addSeries({ name: "Kid's Box · 2", publisher: 'Cambridge', color: '#9b59b6', desc: 'KB2。', grades: ['2'], perGrade: 6, bandOf: GRADES.kbBand });
  addSeries({ name: "Kid's Box · 3", publisher: 'Cambridge', color: '#9b59b6', desc: 'KB3。', grades: ['3'], perGrade: 6, bandOf: GRADES.kbBand });
  addSeries({ name: "Kid's Box · 4", publisher: 'Cambridge', color: '#9b59b6', desc: 'KB4。', grades: ['4'], perGrade: 6, bandOf: GRADES.kbBand });
  addSeries({ name: "Kid's Box · 5", publisher: 'Cambridge', color: '#9b59b6', desc: 'KB5。', grades: ['5'], perGrade: 6, bandOf: GRADES.kbBand });
  addSeries({ name: "Kid's Box · 6", publisher: 'Cambridge', color: '#9b59b6', desc: 'KB6，flyers 衔接。', grades: ['6'], perGrade: 6, bandOf: GRADES.kbBand });

  addSeries({ name: 'Oxford Reading Tree · Stage 1', publisher: 'Oxford', color: '#2c7b3f', desc: '牛津树分级阅读，英国小学主流。', grades: ['Stage 1'], perGrade: 4, bandOf: GRADES.ortBand });
  addSeries({ name: 'Oxford Reading Tree · Stage 2', publisher: 'Oxford', color: '#2c7b3f', desc: 'ORT Stage 2。', grades: ['Stage 2'], perGrade: 4, bandOf: GRADES.ortBand });
  addSeries({ name: 'Oxford Reading Tree · Stage 3', publisher: 'Oxford', color: '#2c7b3f', desc: 'ORT Stage 3。', grades: ['Stage 3'], perGrade: 4, bandOf: GRADES.ortBand });
  addSeries({ name: 'Oxford Reading Tree · Stage 4', publisher: 'Oxford', color: '#2c7b3f', desc: 'ORT Stage 4。', grades: ['Stage 4'], perGrade: 4, bandOf: GRADES.ortBand });
  addSeries({ name: 'Oxford Reading Tree · Stage 5', publisher: 'Oxford', color: '#2c7b3f', desc: 'ORT Stage 5。', grades: ['Stage 5'], perGrade: 4, bandOf: GRADES.ortBand });
  addSeries({ name: 'Oxford Reading Tree · Stage 6', publisher: 'Oxford', color: '#2c7b3f', desc: 'ORT Stage 6。', grades: ['Stage 6'], perGrade: 4, bandOf: GRADES.ortBand });
  addSeries({ name: 'Oxford Reading Tree · Stage 7', publisher: 'Oxford', color: '#2c7b3f', desc: 'ORT Stage 7。', grades: ['Stage 7'], perGrade: 4, bandOf: GRADES.ortBand });
  addSeries({ name: 'Oxford Reading Tree · Stage 8', publisher: 'Oxford', color: '#2c7b3f', desc: 'ORT Stage 8。', grades: ['Stage 8'], perGrade: 4, bandOf: GRADES.ortBand });
  addSeries({ name: 'Oxford Reading Tree · Stage 9', publisher: 'Oxford', color: '#2c7b3f', desc: 'ORT Stage 9。', grades: ['Stage 9'], perGrade: 4, bandOf: GRADES.ortBand });

  addSeries({ name: '典范英语 · 2', publisher: '牛津·典范', color: '#a0522d', desc: '典范英语分级，故事性强。', grades: ['2'], perGrade: 4, bandOf: GRADES.goodBand });
  addSeries({ name: '典范英语 · 3', publisher: '牛津·典范', color: '#a0522d', desc: '典范 3。', grades: ['3'], perGrade: 4, bandOf: GRADES.goodBand });
  addSeries({ name: '典范英语 · 4', publisher: '牛津·典范', color: '#a0522d', desc: '典范 4。', grades: ['4'], perGrade: 4, bandOf: GRADES.goodBand });
  addSeries({ name: '典范英语 · 5', publisher: '牛津·典范', color: '#a0522d', desc: '典范 5。', grades: ['5'], perGrade: 4, bandOf: GRADES.goodBand });
  addSeries({ name: '典范英语 · 6', publisher: '牛津·典范', color: '#a0522d', desc: '典范 6。', grades: ['6'], perGrade: 4, bandOf: GRADES.goodBand });

  addSeries({ name: '新概念英语 · 1', publisher: '外语教学与研究出版社', color: '#34495e', desc: '经典新概念，成人少儿皆宜。', grades: ['1'], perGrade: 5, bandOf: GRADES.ncBand });
  addSeries({ name: '新概念英语 · 2', publisher: '外语教学与研究出版社', color: '#34495e', desc: '新概念 2，句式扎实。', grades: ['2'], perGrade: 5, bandOf: GRADES.ncBand });
  addSeries({ name: '新概念英语 · 3', publisher: '外语教学与研究出版社', color: '#34495e', desc: '新概念 3，短文写作。', grades: ['3'], perGrade: 5, bandOf: GRADES.ncBand });
  addSeries({ name: '新概念英语 · 4', publisher: '外语教学与研究出版社', color: '#34495e', desc: '新概念 4，高阶阅读。', grades: ['4'], perGrade: 5, bandOf: GRADES.ncBand });
  addSeries({ name: '新概念英语青少版 · 1A', publisher: '外语教学与研究出版社', color: '#2c3e50', desc: '青少版 1A，情景对话。', grades: ['1A'], perGrade: 5, bandOf: GRADES.ncjBand });
  addSeries({ name: '新概念英语青少版 · 1B', publisher: '外语教学与研究出版社', color: '#2c3e50', desc: '青少版 1B。', grades: ['1B'], perGrade: 5, bandOf: GRADES.ncjBand });
  addSeries({ name: '新概念英语青少版 · 2A', publisher: '外语教学与研究出版社', color: '#2c3e50', desc: '青少版 2A。', grades: ['2A'], perGrade: 5, bandOf: GRADES.ncjBand });
  addSeries({ name: '新概念英语青少版 · 2B', publisher: '外语教学与研究出版社', color: '#2c3e50', desc: '青少版 2B。', grades: ['2B'], perGrade: 5, bandOf: GRADES.ncjBand });
  addSeries({ name: '新概念英语青少版 · 3A', publisher: '外语教学与研究出版社', color: '#2c3e50', desc: '青少版 3A。', grades: ['3A'], perGrade: 5, bandOf: GRADES.ncjBand });
  addSeries({ name: '新概念英语青少版 · 3B', publisher: '外语教学与研究出版社', color: '#2c3e50', desc: '青少版 3B。', grades: ['3B'], perGrade: 5, bandOf: GRADES.ncjBand });

  addSeries({ name: '丽声 Raz 分级阅读 · 1', publisher: '外语教学与研究出版社', color: '#16a085', desc: '丽声 Raz 分级，拼读同步。', grades: ['1'], perGrade: 4, bandOf: GRADES.razBand });
  addSeries({ name: '丽声 Raz 分级阅读 · 2', publisher: '外语教学与研究出版社', color: '#16a085', desc: 'Raz 2。', grades: ['2'], perGrade: 4, bandOf: GRADES.razBand });
  addSeries({ name: '丽声 Raz 分级阅读 · 3', publisher: '外语教学与研究出版社', color: '#16a085', desc: 'Raz 3。', grades: ['3'], perGrade: 4, bandOf: GRADES.razBand });
  addSeries({ name: '丽声 Raz 分级阅读 · 4', publisher: '外语教学与研究出版社', color: '#16a085', desc: 'Raz 4。', grades: ['4'], perGrade: 4, bandOf: GRADES.razBand });
  addSeries({ name: '丽声 Raz 分级阅读 · 5', publisher: '外语教学与研究出版社', color: '#16a085', desc: 'Raz 5。', grades: ['5'], perGrade: 4, bandOf: GRADES.razBand });
  addSeries({ name: '丽声 Raz 分级阅读 · 6', publisher: '外语教学与研究出版社', color: '#16a085', desc: 'Raz 6。', grades: ['6'], perGrade: 4, bandOf: GRADES.razBand });
  addSeries({ name: '丽声 Raz 分级阅读 · 7', publisher: '外语教学与研究出版社', color: '#16a085', desc: 'Raz 7。', grades: ['7'], perGrade: 4, bandOf: GRADES.razBand });
  addSeries({ name: '丽声 Raz 分级阅读 · 8', publisher: '外语教学与研究出版社', color: '#16a085', desc: 'Raz 8。', grades: ['8'], perGrade: 4, bandOf: GRADES.razBand });
  addSeries({ name: '丽声 Raz 分级阅读 · 9', publisher: '外语教学与研究出版社', color: '#16a085', desc: 'Raz 9。', grades: ['9'], perGrade: 4, bandOf: GRADES.razBand });

  addSeries({ name: '海尼曼 Heinemann · GK', publisher: 'Heinemann', color: '#e67e22', desc: '海尼曼分级，句型重复训练。', grades: ['GK'], perGrade: 4, bandOf: GRADES.heiBand });
  addSeries({ name: '海尼曼 Heinemann · G1', publisher: 'Heinemann', color: '#e67e22', desc: 'Heinemann G1。', grades: ['G1'], perGrade: 4, bandOf: GRADES.heiBand });
  addSeries({ name: '海尼曼 Heinemann · G2', publisher: 'Heinemann', color: '#e67e22', desc: 'Heinemann G2。', grades: ['G2'], perGrade: 4, bandOf: GRADES.heiBand });

  addSeries({ name: '大猫 Big Cat · 1', publisher: 'Collins·牛津', color: '#c0392b', desc: '大猫分级阅读，图画丰富。', grades: ['1'], perGrade: 4, bandOf: GRADES.catBand });
  addSeries({ name: '大猫 Big Cat · 2', publisher: 'Collins·牛津', color: '#c0392b', desc: 'Big Cat 2。', grades: ['2'], perGrade: 4, bandOf: GRADES.catBand });
  addSeries({ name: '大猫 Big Cat · 3', publisher: 'Collins·牛津', color: '#c0392b', desc: 'Big Cat 3。', grades: ['3'], perGrade: 4, bandOf: GRADES.catBand });
  addSeries({ name: '大猫 Big Cat · 4', publisher: 'Collins·牛津', color: '#c0392b', desc: 'Big Cat 4。', grades: ['4'], perGrade: 4, bandOf: GRADES.catBand });
  addSeries({ name: '大猫 Big Cat · 5', publisher: 'Collins·牛津', color: '#c0392b', desc: 'Big Cat 5。', grades: ['5'], perGrade: 4, bandOf: GRADES.catBand });
  addSeries({ name: '大猫 Big Cat · 6', publisher: 'Collins·牛津', color: '#c0392b', desc: 'Big Cat 6。', grades: ['6'], perGrade: 4, bandOf: GRADES.catBand });
  addSeries({ name: '大猫 Big Cat · 7', publisher: 'Collins·牛津', color: '#c0392b', desc: 'Big Cat 7。', grades: ['7'], perGrade: 4, bandOf: GRADES.catBand });

  addSeries({ name: 'Oxford Discover · 1', publisher: 'Oxford', color: '#27ae60', desc: '牛津友邻，探究式学习。', grades: ['1'], perGrade: 5, bandOf: GRADES.odBand });
  addSeries({ name: 'Oxford Discover · 2', publisher: 'Oxford', color: '#27ae60', desc: 'OD 2。', grades: ['2'], perGrade: 5, bandOf: GRADES.odBand });
  addSeries({ name: 'Oxford Discover · 3', publisher: 'Oxford', color: '#27ae60', desc: 'OD 3。', grades: ['3'], perGrade: 5, bandOf: GRADES.odBand });
  addSeries({ name: 'Oxford Discover · 4', publisher: 'Oxford', color: '#27ae60', desc: 'OD 4。', grades: ['4'], perGrade: 5, bandOf: GRADES.odBand });
  addSeries({ name: 'Oxford Discover · 5', publisher: 'Oxford', color: '#27ae60', desc: 'OD 5。', grades: ['5'], perGrade: 5, bandOf: GRADES.odBand });
  addSeries({ name: 'Oxford Discover · 6', publisher: 'Oxford', color: '#27ae60', desc: 'OD 6。', grades: ['6'], perGrade: 5, bandOf: GRADES.odBand });

  addSeries({ name: '朗文 Super Kids · 1', publisher: 'Pearson·朗文', color: '#e74c3c', desc: '朗文 Super Kids，活泼入门。', grades: ['1'], perGrade: 5, bandOf: GRADES.skBand });
  addSeries({ name: '朗文 Super Kids · 2', publisher: 'Pearson·朗文', color: '#e74c3c', desc: 'SK 2。', grades: ['2'], perGrade: 5, bandOf: GRADES.skBand });
  addSeries({ name: '朗文 Super Kids · 3', publisher: 'Pearson·朗文', color: '#e74c3c', desc: 'SK 3。', grades: ['3'], perGrade: 5, bandOf: GRADES.skBand });
  addSeries({ name: '朗文 Super Kids · 4', publisher: 'Pearson·朗文', color: '#e74c3c', desc: 'SK 4。', grades: ['4'], perGrade: 5, bandOf: GRADES.skBand });
  addSeries({ name: '朗文 Super Kids · 5', publisher: 'Pearson·朗文', color: '#e74c3c', desc: 'SK 5。', grades: ['5'], perGrade: 5, bandOf: GRADES.skBand });
  addSeries({ name: '朗文 Super Kids · 6', publisher: 'Pearson·朗文', color: '#e74c3c', desc: 'SK 6。', grades: ['6'], perGrade: 5, bandOf: GRADES.skBand });

  addSeries({ name: '朗文 新派英语 · 1', publisher: 'Pearson·朗文', color: '#d35400', desc: '朗文新派，主题式教学。', grades: ['1'], perGrade: 5, bandOf: GRADES.xpBand });
  addSeries({ name: '朗文 新派英语 · 2', publisher: 'Pearson·朗文', color: '#d35400', desc: '新派 2。', grades: ['2'], perGrade: 5, bandOf: GRADES.xpBand });
  addSeries({ name: '朗文 新派英语 · 3', publisher: 'Pearson·朗文', color: '#d35400', desc: '新派 3。', grades: ['3'], perGrade: 5, bandOf: GRADES.xpBand });
  addSeries({ name: '朗文 新派英语 · 4', publisher: 'Pearson·朗文', color: '#d35400', desc: '新派 4。', grades: ['4'], perGrade: 5, bandOf: GRADES.xpBand });
  addSeries({ name: '朗文 新派英语 · 5', publisher: 'Pearson·朗文', color: '#d35400', desc: '新派 5。', grades: ['5'], perGrade: 5, bandOf: GRADES.xpBand });
  addSeries({ name: '朗文 新派英语 · 6', publisher: 'Pearson·朗文', color: '#d35400', desc: '新派 6。', grades: ['6'], perGrade: 5, bandOf: GRADES.xpBand });

  addSeries({ name: '剑桥少儿英语 · Starter', publisher: 'Cambridge YLE', color: '#8e44ad', desc: 'YLE Starter 备考启蒙。', grades: ['Starter'], perGrade: 5, bandOf: GRADES.cyeBand });
  addSeries({ name: '剑桥少儿英语 · Movers', publisher: 'Cambridge YLE', color: '#8e44ad', desc: 'YLE Movers。', grades: ['Movers'], perGrade: 5, bandOf: GRADES.cyeBand });
  addSeries({ name: '剑桥少儿英语 · Flyers', publisher: 'Cambridge YLE', color: '#8e44ad', desc: 'YLE Flyers。', grades: ['Flyers'], perGrade: 5, bandOf: GRADES.cyeBand });

})();
