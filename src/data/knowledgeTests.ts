import type { QuizQuestion } from '../types/academy';

type QuestionRow = [question: string, answer: string, firstDistractor: string, secondDistractor: string, thirdDistractor: string, explanation: string];

const prayer = 'https://islamansiklopedisi.org.tr/namaz';
const ablution = 'https://islamansiklopedisi.org.tr/abdest';
const quran = 'https://kuran.diyanet.gov.tr/Tefsir';
const mushaf = 'https://islamansiklopedisi.org.tr/mushaf';
const fasting = 'https://islamansiklopedisi.org.tr/oruc';
const zakat = 'https://islamansiklopedisi.org.tr/zekat';
const pilgrimage = 'https://islamansiklopedisi.org.tr/hac';

function test(id: string, title: string, source: string, rows: QuestionRow[]) {
  return {
    id, title, source,
    questions: rows.map(([question, answer, first, second, third, explanation], index): QuizQuestion => {
      const options = [first, second, third];
      const correctIndex = (index * 3 + Number(id) - 1) % 4;
      options.splice(correctIndex, 0, answer);
      return { id: `test-${id}-${index + 1}`, question, options, correctIndex, explanation };
    }),
  };
}

export const KNOWLEDGE_TESTS = [
  test('1', 'Beş vakit namaz', prayer, [
    ['Bir öğrenci vakitleri sabah, öğle, ikindi ve yatsı diye sıraladı. Hangi vakit eksik kaldı?', 'Akşam', 'Kuşluk', 'Teravih', 'Vitir', 'Beş vakit sabah, öğle, ikindi, akşam ve yatsıdır.'],
    ['Sadece ikindi namazının farzı çizelgeye işlenecek. Kaç rekât yazılmalı?', 'Dört', 'İki', 'Üç', 'Altı', 'İkindi namazının farzı dört rekâttır.'],
    ['Akşam ve yatsı namazlarının farzları birlikte kaç rekâttır?', 'Yedi', 'Beş', 'Altı', 'Sekiz', 'Akşamın üç ve yatsının dört rekât farzı toplam yedi eder.'],
    ['Gecenin bitiminde, güneş doğmadan önce vaktinde kılınan günlük farz namaz hangisidir?', 'Sabah', 'Öğle', 'Akşam', 'Yatsı', 'Sabah namazının vakti fecr-i sâdıkla başlar ve güneşin doğuşuyla biter.'],
    ['Öğle ile ikindi arasındaki sıralamayı gösteren bir çizelgede ikindiden sonra hangi vakit gelir?', 'Akşam', 'Sabah', 'Öğle', 'Yatsı', 'Günlük sıra içinde ikindiyi akşam namazı takip eder.'],
    ['Sabah ve öğle namazlarının yalnız farzları bir arada sayıldığında sonuç kaçtır?', 'Altı', 'Dört', 'Beş', 'Yedi', 'Sabahın iki ve öğlenin dört rekât farzı toplam altıdır.'],
    ['Yalnızca güneş battıktan sonra başlayan vakit soruluyor. Hangisi seçilir?', 'Akşam', 'İkindi', 'Sabah', 'Öğle', 'Akşam namazının vakti güneşin batışıyla girer.'],
    ['Günlük farzlar arasında tek sayıda rekâtı olan namaz hangisidir?', 'Akşam', 'Sabah', 'Öğle', 'Yatsı', 'Akşam üç rekâttır, diğer günlük farzlar iki veya dörttür.'],
    ['Öğlenin farzı ile yatsının farzı karşılaştırıldığında hangi sonuç çıkar?', 'İkisi de dört rekâttır', 'İkisi de üç rekâttır', 'Öğle iki, yatsı dört rekâttır', 'Öğle dört, yatsı üç rekâttır', 'Öğle ve yatsı namazlarının farzları dört rekâttır.'],
    ['Beş vakit namazın yalnız farz rekâtları bir gün boyunca toplam kaçtır?', 'On yedi', 'On dört', 'On beş', 'On dokuz', '2 + 4 + 4 + 3 + 4 = 17 farz rekât eder.'],
  ]),
  test('2', 'Namazın hareketleri ve kavramları', prayer, [
    ['Bir öğrenci namazda ayakta durulan kısmı tarif ediyor. Hangi terimi kullanmalı?', 'Kıyam', 'Kıraat', 'Ka‘de', 'Rükû', 'Kıyam, namazda ayakta durmayı ifade eder.'],
    ['Namazda Kur’an okunmasını karşılayan terim hangisidir?', 'Kıraat', 'Tekbir', 'Tahiyyat', 'Secde', 'Kıraat, namazın Kur’an okuma bölümüdür.'],
    ['Belden öne eğilerek yapılan hareket hangisidir?', 'Rükû', 'Secde', 'Kıyam', 'Ka‘de', 'Rükû, kıyamdan sonra belden eğilmektir.'],
    ['Alın yere konulduğunda namazın hangi hareketi yapılır?', 'Secde', 'Rükû', 'Kıraat', 'Kıyam', 'Secde, alnın yere konulduğu harekettir.'],
    ['Bir rekâtta birinci secdeden sonra kısa süre oturan kişi ardından ne yapar?', 'İkinci secdeye gider', 'Kıraate başlar', 'Tekrar rükûya gider', 'Namaza yeniden niyet eder', 'Bir rekâtta iki secde vardır ve aralarında kısa bir oturuş bulunur.'],
    ['Namazda son oturuşu belirtmek için hangi terim kullanılır?', 'Ka‘de-i ahîre', 'İftitah tekbiri', 'İstikbâl-i kıble', 'Kıraat', 'Ka‘de-i ahîre, namazın son oturuşudur.'],
    ['Namaza girişte alınan tekbirin özel adı hangisidir?', 'İftitah tekbiri', 'Teşrik tekbiri', 'İntikal tekbiri', 'Bayram tekbiri', 'İftitah tekbiri namazı başlatır.'],
    ['Namaza hazırlanırken Kâbe yönüne dönme şartının adı nedir?', 'İstikbâl-i kıble', 'Setr-i avret', 'Hadesten tahâret', 'Necâsetten tahâret', 'İstikbâl-i kıble, namazda kıbleye yönelmektir.'],
    ['Namazda örtülmesi gereken yerlerin örtülmesini hangi terim anlatır?', 'Setr-i avret', 'Ka‘de-i ahîre', 'Kıyam', 'İstikbâl-i kıble', 'Setr-i avret namazın örtünmeyle ilgili şartıdır.'],
    ['Kıyamda kıraat yapıldıktan sonra normal bir rekâtta önce hangisi gelir?', 'Rükû', 'İkinci secde', 'Son oturuş', 'Selam', 'Kıyam ve kıraatin ardından rükûya gidilir.'],
  ]),
  test('3', 'Abdest, gusül ve teyemmüm', ablution, [
    ['Mâide 5/6’da anlatılan abdestte yıkanmak yerine mesh edilen yer hangisidir?', 'Baş', 'Yüz', 'Kollar', 'Ayaklar', 'Âyette başın mesh edilmesi belirtilir.'],
    ['Abdest alırken kolların yıkanması hangi sınıra kadar tarif edilir?', 'Dirsekler dâhil', 'Bilekler dâhil', 'Omuzlar dâhil', 'Parmak boğumları dâhil', 'Kollar dirseklerle birlikte yıkanır.'],
    ['Mâide 5/6’ya göre abdestte ayakların yıkanacağı sınır hangisidir?', 'Topuklar dâhil', 'Dizler dâhil', 'Ayak tarağına kadar', 'Yalnız parmaklar', 'Abdestte ayaklar topuk kemikleriyle birlikte yıkanır.'],
    ['Hangisi Hanefî uygulamasında abdestin yıkanan farz bölgelerinden biridir?', 'Yüz', 'Boyun', 'Kulak', 'Omuz', 'Yüzü yıkamak abdestin farzlarındandır.'],
    ['Bütün bedenin suyla yıkanmasını içeren hükmî temizliğin adı nedir?', 'Gusül', 'Teyemmüm', 'Mesh', 'İstincâ', 'Gusül bütün bedeni yıkamayı içeren hükmî temizliktir.'],
    ['Usulüne uygun aramaya rağmen su bulunamadığında abdest yerine hangi temizlik yapılır?', 'Teyemmüm', 'Sadece elleri silme', 'Sadece elbiseyi temizleme', 'Kıbleye dönme', 'Su bulunamadığında gerekli şartlarla teyemmüm yapılır.'],
    ['Teyemmümün yapılışını hangi ifade doğru tarif eder?', 'Temiz toprak cinsinden bir maddeyle mesh', 'Bir bezle bütün bedeni silme', 'Yalnız ayakları suyla yıkama', 'Yalnız başa su sürme', 'Teyemmüm temiz toprak cinsinden bir maddeyle yüz ve kolları mesh etmeyi içerir.'],
    ['Kıyafetteki pisliği temizlemek, namaza hazırlığın hangi şartıyla ilgilidir?', 'Necâsetten tahâret', 'Hadesten tahâret', 'Vaktin girmesi', 'İstikbâl-i kıble', 'Beden, kıyafet ve namaz yerindeki maddî pisliğin giderilmesi necâsetten tahârettir.'],
    ['Abdest veya gusül ile giderilen hükmî kirlilikten temizlenme hangi terimle anlatılır?', 'Hadesten tahâret', 'Setr-i avret', 'Necâsetten tahâret', 'İstikbâl-i kıble', 'Hadesten tahâret, abdest veya gusül gerektiren hükmî hâlin giderilmesidir.'],
    ['Abdestte hangi işlem yıkama ile mesh arasındaki farkı gösterir?', 'Yüzü yıkayıp başı mesh etmek', 'Yüz ve başı yalnız mesh etmek', 'Yüz ve başı yalnız yıkamak', 'Yüzü mesh edip başı yıkamak', 'Yüz suyla yıkanır, baş ıslak elle mesh edilir.'],
  ]),
  test('4', 'Cemaat, cuma ve özel namazlar', prayer, [
    ['Cemaatle namazda önde durup cemaate namaz kıldıran kişiye ne denir?', 'İmam', 'Hatip', 'Müezzin', 'Vâiz', 'Namazda cemaate önderlik eden kişi imamdır.'],
    ['Müezzin farz namaza hemen başlanacağını duyuracak. Hangi çağrıyı yapar?', 'Kamet', 'Salâ', 'Tesbihat', 'Hutbe', 'Kamet, farz namazın başlamasına yakın okunur.'],
    ['Cuma günü hutbe tamamlandı ve kamet getirildi. Cuma farzı kaç rekât kılınır?', 'İki', 'Üç', 'Dört', 'Altı', 'Cuma namazının farzı iki rekâttır.'],
    ['Cuma ve bayram hutbelerinin namaza göre sırası nasıldır?', 'Cuma hutbesi namazdan önce, bayram hutbesi namazdan sonra', 'Her iki hutbe de namazdan önce', 'Her iki hutbe de namazdan sonra', 'Cuma hutbesi namazdan sonra, bayram hutbesi namazdan önce', 'Cuma hutbesi cuma farzından önce, bayram hutbesi bayram namazından sonra okunur.'],
    ['Cenaze namazında hangi hareketler bulunmaz?', 'Rükû ve secde', 'Ayakta durma ve tekbir', 'Niyet ve dua', 'Tekbir ve selam', 'Cenaze namazı ayakta, tekbir ve dualarla kılınır. Rükû ve secde yoktur.'],
    ['Ramazan gecelerinde yatsının farzından sonra kılınan namaz hangisidir?', 'Teravih', 'Kuşluk', 'İşrak', 'Bayram', 'Teravih, ramazan gecelerinde yatsıdan sonra kılınır.'],
    ['Hanefî mezhebinde vitir namazının hükmü hangi seçenekle ifade edilir?', 'Vâcip', 'Farz-ı kifâye', 'Farz-ı ayn', 'Mekruh', 'Hanefî mezhebinde vitir vâcip kabul edilir.'],
    ['Namaz başladıktan sonra imama yetişen ve bazı rekâtları kaçıran kişiye ne denir?', 'Mesbûk', 'Münferit', 'Müezzin', 'Mukim', 'Mesbûk, cemaat namazının başına yetişemeyen kişidir.'],
    ['Kimi Müslümanlar kılınca diğerlerinden cenaze namazı yükümlülüğünün kalkması hangi hükmü anlatır?', 'Farz-ı kifâye', 'Farz-ı ayn', 'Sünnet-i gayr-i müekkede', 'Nafile', 'Cenaze namazı toplum adına yerine getirilen farz-ı kifâyedir.'],
    ['Cuma hutbesinin ilk bölümü bitince hatip ikinci bölümden önce ne yapar?', 'Kısa süre oturur', 'Kameti okur', 'Mihraba geçer', 'Cuma farzını başlatır', 'İki hutbe arasında kısa bir oturuş yer alır.'],
  ]),
  test('5', 'Kur’an, mushaf ve okuma terimleri', mushaf, [
    ['Bir kütüphane kataloğunda Kur’an metninin iki kapak arasındaki nüshası nasıl adlandırılır?', 'Mushaf', 'Tefsir', 'Meal', 'Hadis mecmuası', 'Mushaf, Kur’an âyetlerinin bir araya getirildiği kitap nüshasıdır.'],
    ['Bir sûrenin numaralandırılmış bölümlerinden birine ne denir?', 'Âyet', 'Cüz', 'Hizip', 'Tertip', 'Sûreler bir veya birden çok âyetten oluşur.'],
    ['Kur’an’ın Fâtiha, Bakara ve Âl-i İmrân gibi adlandırılmış bölümleri hangi terimle anılır?', 'Sûre', 'Cüz', 'Âyet', 'Hizip', 'Fâtiha, Bakara ve Âl-i İmrân birer sûredir.'],
    ['Mushafı günlük okuma için 30 bölüme ayıran yaygın birim nedir?', 'Cüz', 'Sûre', 'Âyet', 'Sayfa', 'Yaygın bölümlemede Kur’an 30 cüze ayrılır.'],
    ['Kur’an’ın Arapça metnindeki anlamı başka bir dile aktaran çalışmaya ne denir?', 'Meal', 'Mushaf', 'Tecvid', 'Tilâvet', 'Meal, Kur’an’ın anlamını başka dile aktaran çalışmadır.'],
    ['Âyetlerin bağlamını ve anlamını ayrıntılı açıklayan eser hangi türdendir?', 'Tefsir', 'Fihrist', 'Mushaf', 'Elifbâ', 'Tefsir, âyetlerin anlamlarını açıklama ve yorumlama çalışmasıdır.'],
    ['Mushafın başındaki sûre ile sonundaki sûre hangi seçenekte doğru eşleştirilmiştir?', 'Fâtiha ve Nâs', 'Bakara ve Felak', 'Alak ve İhlâs', 'Fâtiha ve Kevser', 'Mushaf tertibi Fâtiha ile başlar, Nâs ile biter.'],
    ['Mushaf fihristi hazırlayan biri yaygın tertipte kaç sûre adı listeler?', '114', '110', '112', '120', 'Yaygın mushaf tertibinde 114 sûre bulunur.'],
    ['Bir okuyucu Kur’an’ı baştan sona tamamladı. Bu okuyuşa hangi ad verilir?', 'Hatim', 'Tecvid', 'Meal', 'İstiâze', 'Kur’an’ı baştan sona okumaya hatim denir.'],
    ['Harfleri çıkış yerleri ve okuma kurallarıyla doğru okumayı hangi alan öğretir?', 'Tecvid', 'Tefsir', 'Fıkıh', 'Siyer', 'Tecvid, harflerin mahreçlerini ve Kur’an’ı doğru okuma kurallarını öğretir.'],
  ]),
  test('6', 'Sûreleri tanıyalım', quran, [
    ['Mushaf sırasına göre Fâtiha’dan hemen sonra hangi sûre açılır?', 'Bakara', 'Nisâ', 'İhlâs', 'Âl-i İmrân', 'Bakara, mushaf sırasındaki ikinci sûredir.'],
    ['Hz. Yûsuf’un kardeşleriyle ilişkisini ve Mısır’daki hayatını anlatan kıssa hangi sûrede geniş yer tutar?', 'Yûsuf', 'Kehf', 'Yûnus', 'Hûd', 'Hz. Yûsuf’un kıssası Yûsuf sûresinde ayrıntılı anlatılır.'],
    ['Mağaraya sığınan gençleri arayan öğrenci hangi sûreyi açmalıdır?', 'Kehf', 'Neml', 'Kasas', 'Mülk', 'Mağara arkadaşlarının kıssası Kehf sûresinde yer alır.'],
    ['Adı “fil” anlamına gelen ve fil ordusundan söz eden sûre hangisidir?', 'Fîl', 'Nahl', 'Neml', 'Ankebût', 'Fîl sûresi fil ordusunu konu alır.'],
    ['Kur’an’da adı “arı” anlamına gelen sûre hangisidir?', 'Nahl', 'Neml', 'En‘âm', 'Ankebût', 'Nahl Arapçada bal arısı anlamına gelir.'],
    ['Kısa adı “karınca” anlamına gelen sûre hangisidir?', 'Neml', 'Nahl', 'Fîl', 'Bakara', 'Neml sûresi adını Hz. Süleyman kıssasında geçen karıncadan alır.'],
    ['“De ki O, Allah’tır, tektir” anlamındaki ifadeyle başlayan sûre hangisidir?', 'İhlâs', 'Felak', 'Nâs', 'Kâfirûn', 'İhlâs sûresi Allah’ın birliğini bildiren bu ifadeyle başlar.'],
    ['“De ki sığınırım sabahın Rabbine” anlamındaki ifadeyle hangi sûre başlar?', 'Felak', 'Nâs', 'Duhâ', 'Asr', 'Felak sûresinin başında sabahın Rabbine sığınılır.'],
    ['Mushafın sonunda Felak’tan hemen sonra hangi sûre gelir?', 'Nâs', 'İhlâs', 'Tebbet', 'Nasr', 'Felak 113., Nâs 114. sûredir.'],
    ['“Amme” diye de anılan, 30. cüzün başındaki sûre hangisidir?', 'Nebe', 'Nâziât', 'Mülk', 'Yâsîn', '30. cüz, “Amme yetesâelûn” sözleriyle başlayan Nebe sûresiyle açılır.'],
  ]),
  test('7', 'Âyetleri, konularını ve adreslerini bulma', quran, [
    ['Öğretmen Âyetü’l-Kürsî’yi açmanızı istedi. Hangi âyet numarasına bakarsınız?', 'Bakara 2/255', 'Bakara 2/183', 'Nahl 16/90', 'Cuma 62/9', 'Âyetü’l-Kürsî, Bakara sûresinin 255. âyetidir.'],
    ['Fâtiha 1/5 gösteriminde sondaki 5 hangi bilgiyi verir?', 'Âyetin sûre içindeki numarasını', 'Mushafın sayfa numarasını', 'Cüz numarasını', 'Sûrenin iniş sırasını', 'Sûre numarasından sonra yazılan sayı, âyetin o sûre içindeki yeridir.'],
    ['Abdestte yıkanan yerleri ve mesh işlemini anlatan âyet hangisidir?', 'Mâide 5/6', 'Enfâl 8/41', 'Nahl 16/90', 'Kehf 18/10', 'Mâide 5/6 abdest, gusül ve teyemmümle ilgili hükümleri bildirir.'],
    ['“İnnallâhe ye’muru bi’l-adli ve’l-ihsân” ifadesiyle başlayan hutbe kapanış âyeti nerededir?', 'Nahl 16/90', 'Cuma 62/9', 'Ahzâb 33/56', 'Mâide 5/6', 'Nahl 16/90 adalet, iyilik ve yakınlara yardım emrini içerir.'],
    ['Allah’ın ve meleklerin Peygamber’e salât ettiğini bildiren âyet hangisidir?', 'Ahzâb 33/56', 'Sâffât 37/100', 'Furkân 25/74', 'Bakara 2/201', 'Ahzâb 33/56 müminlere de Peygamber’e salât ve selâm etmeyi bildirir.'],
    ['Cuma namazı çağrısı yapıldığında alışverişi bırakmayı bildiren âyet nerededir?', 'Cuma 62/9', 'Cuma 62/2', 'Nahl 16/90', 'Hac 22/27', 'Cuma 62/9, çağrı yapıldığında alışverişi bırakıp Allah’ı anmaya yönelmeyi bildirir.'],
    ['“Rabbenâ âtinâ” duasında hangi iki hayat için iyilik istenir?', 'Dünya ve âhiret', 'Çocukluk ve gençlik', 'Sabah ve akşam', 'Yolculuk ve konaklama', 'Bakara 2/201’de dünya ve âhirette iyilik istenir.'],
    ['Hz. Mûsâ’nın sözünün anlaşılması için dua ettiği bölüm hangisidir?', 'Tâhâ 20/25–28', 'Yûsuf 12/4–6', 'Kehf 18/1–4', 'Mülk 67/1–4', 'Hz. Mûsâ Tâhâ 20/25–28’de işinin kolaylaştırılmasını ve sözünün anlaşılmasını diler.'],
    ['Kadir sûresinde hangi gece bin aydan daha hayırlı olarak anlatılır?', 'Kadir gecesi', 'Cuma gecesi', 'Bayram gecesi', 'Berat gecesi', 'Kadir sûresinin üçüncü âyetinde Kadir gecesinin bin aydan daha hayırlı olduğu bildirilir.'],
    ['Asr sûresinde iman ve iyi işlerin yanında hangi iki tavsiye birlikte yer alır?', 'Hakkı ve sabrı tavsiye etmek', 'Yalnız kalmayı ve susmayı tavsiye etmek', 'Yolculuğu ve dinlenmeyi tavsiye etmek', 'Ticareti ve biriktirmeyi tavsiye etmek', 'Asr sûresi hakkı ve sabrı karşılıklı tavsiye etmeyi birlikte anar.'],
  ]),
  test('8', 'Ramazan ve oruç', fasting, [
    ['Oruç tutmak için gece veya seherde yenilen öğüne ne denir?', 'Sahur', 'İftar', 'Fitre', 'Fidye', 'Sahur, oruca hazırlık için imsak öncesinde yenilen öğündür.'],
    ['Güneş batınca orucu açmak için kullanılan terim hangisidir?', 'İftar', 'İmsak', 'Sahur', 'İtikâf', 'İftar, güneş battığında orucu açmaktır.'],
    ['Ramazan orucunda yeme ve içmeden uzak durulan süre hangi iki sınır arasındadır?', 'Fecr-i sâdık ve güneşin batışı', 'Güneşin doğuşu ve öğle', 'Öğle ve güneşin batışı', 'Güneşin batışı ve yatsı', 'Günlük oruç vakti fecr-i sâdıkla başlar ve güneşin batmasıyla biter.'],
    ['Bakara 2/183’te orucun hedefi olarak hangi bilinç ifade edilir?', 'Takvâ', 'Ticaret', 'Yolculuk', 'Yarışma', 'Âyet orucun takvâ bilinci kazandırmasına işaret eder.'],
    ['Ramazan’da tutulamayan bir günü, daha sonra bir gün oruç tutarak yerine getirmeye ne denir?', 'Kaza', 'Sahur', 'İftar', 'İtikâf', 'Vakitten sonra ibadetin yerine getirilmesi kaza olarak adlandırılır.'],
    ['İyileşmesi beklenmeyen hastalık veya ileri yaş nedeniyle oruç tutamayanlar için ilgili fıkıh terimi hangisidir?', 'Fidye', 'Nisap', 'Teşrik', 'Sa‘y', 'Sürekli mazeret hâlinde, şartları oluştuğunda oruç fidyesi söz konusu olur.'],
    ['Kur’an’da ramazan ayından ve o ayda indirilen Kur’an’dan hangi âyette söz edilir?', 'Bakara 2/185', 'Mâide 5/6', 'Ahzâb 33/56', 'Cuma 62/9', 'Bakara 2/185 ramazan ayını ve Kur’an’ın indirilişini birlikte anar.'],
    ['Ramazanın son günlerinde camide ibadete çekilmeyi anlatan terim nedir?', 'İtikâf', 'İhram', 'Tavaf', 'İstihâre', 'İtikâf, belirli şartlarla mescitte kalarak ibadete yönelmektir.'],
    ['Ramazan ayıyla bağlantılı olarak verilen fıtır sadakasının yaygın adı hangisidir?', 'Fitre', 'Kefaret', 'Nisap', 'Vakfe', 'Fitre, fıtır sadakasının yaygın adıdır.'],
    ['Bir takvimde “imsak” saati neyi işaret eder?', 'Oruç için yeme ve içmenin bırakılacağı vakti', 'İftar için güneşin battığı vakti', 'Teravih için kamet vaktini', 'Bayram namazının başlayacağı vakti', 'İmsak, orucun başladığı sınırı gösterir.'],
  ]),
  test('9', 'Zekât, sadaka ve paylaşma', zakat, [
    ['Zekâtla yükümlülük için dikkate alınan asgarî mal miktarına ne denir?', 'Nisap', 'Fitre', 'Fidye', 'Kefaret', 'Nisap zekât yükümlülüğü bakımından belirlenen asgarî mal miktarıdır.'],
    ['Bir öğrenci zekât verilebilecek grupları Kur’an’dan araştırıyor. Hangi âyeti açmalı?', 'Tevbe 9/60', 'Mâide 5/6', 'Nahl 16/90', 'Bakara 2/183', 'Tevbe 9/60 zekâtın verileceği grupları bildirir.'],
    ['Tevbe 9/60’ta anılan yararlanıcı gruplarından biri hangisidir?', 'Yolda kalmış kişi', 'Her mal sahibi', 'Her şehir sakini', 'Her iş yeri sahibi', 'Yolculukta muhtaç kalmış kişi âyette sayılan gruplardan biridir.'],
    ['Zekâta tâbi 40.000 birim paranın kırkta biri kaç birimdir?', '1.000', '400', '2.000', '4.000', '40.000 ÷ 40 = 1.000 eder. Soru yalnızca verilen oranın hesabını sorar.'],
    ['Kırkta bir oranı yüzdeyle nasıl yazılır?', '%2,5', '%1', '%5', '%10', '1 ÷ 40 = 0,025, yani yüzde 2,5 eder.'],
    ['Bir kimsenin Allah rızası için malından harcamasını anlatan genel Kur’an kavramı hangisidir?', 'İnfak', 'İtikâf', 'İhram', 'İstikbâl', 'İnfak, Allah rızası için maldan harcamayı ifade eden genel bir kavramdır.'],
    ['İhtiyaç sahibine gönüllü maddî yardımın genel adı hangisidir?', 'Sadaka', 'Nisap', 'Vakfe', 'İmsak', 'Sadaka, gönüllü yardımı ifade eden kullanımlardan biridir.'],
    ['Fitreyi tanımlayan ifade hangisidir?', 'Ramazan ve bayramla bağlantılı fıtır sadakası', 'Hacda Arafat’ta durma', 'Günlük farz namaza çağrı', 'Namazdan önce suyla temizlenme', 'Fitre, Ramazan Bayramı ile bağlantılı fıtır sadakasıdır.'],
    ['“Nisap” ve “zekât” etiketleri olan iki kutuda hangisi ödeme tutarından önce yükümlülük eşiğini anlatır?', 'Nisap', 'Zekât', 'Her ikisi de aynı terimdir', 'İkisi de yalnız ödeme tarihidir', 'Nisap, zekâta tâbi malın yükümlülük bakımından ulaştığı alt sınırdır.'],
    ['Zekâtın toplumsal yönünü hangi örnek en doğrudan gösterir?', 'Malın bir payını hak sahiplerine ulaştırmak', 'Yalnız günlük rekâtları saymak', 'Hac yolculuğunda konaklama seçmek', 'Bir sûrenin âyetlerini numaralandırmak', 'Zekâtın malî ve toplumsal yönü, maldan belirli bir payın hak sahiplerine verilmesidir.'],
  ]),
  test('10', 'Hac ve umre', pilgrimage, [
    ['Kâbe’nin etrafında ibadet amacıyla yapılan dönüşlerin tümüne ne denir?', 'Tavaf', 'Sa‘y', 'Vakfe', 'Telbiye', 'Kâbe etrafındaki ibadete tavaf denir.'],
    ['Tavafta Kâbe etrafındaki her bir dönüş hangi adla anılır?', 'Şavt', 'Rekât', 'Cüz', 'Hizip', 'Bir tam dönüşe şavt denir.'],
    ['Bir tavafın tamamlanması için kaç şavt yapılır?', 'Yedi', 'Üç', 'Beş', 'Dokuz', 'Tavaf yedi şavttan oluşur.'],
    ['Safâ ile Merve arasında yapılan ibadetin adı hangisidir?', 'Sa‘y', 'Vakfe', 'Tavaf', 'Telbiye', 'Sa‘y, Safâ ile Merve arasında belirli şekilde gidip gelmektir.'],
    ['Hacda Arafat’ta belirli vakitte bir süre bulunmak ne olarak adlandırılır?', 'Vakfe', 'Tavaf', 'İhram', 'Telbiye', 'Arafat vakfesi belirlenmiş zaman içinde Arafat’ta bulunmaktır.'],
    ['“Lebbeyk Allahümme lebbeyk” diye başlayan sözler hangi adla bilinir?', 'Telbiye', 'Tekbir-i iftitah', 'İstiâze', 'Kamet', 'Hac ve umrede okunan bu çağrıya telbiye denir.'],
    ['Hac veya umreye girişte belirli yasaklara uyulan ibadet hâline ne denir?', 'İhram', 'İtikâf', 'İmsak', 'Vakfe', 'İhram, niyetle girilen ve belirli yasaklara uyulan ibadet hâlidir.'],
    ['İhrama girilmesi için belirlenen sınır veya zaman hangi terimle anılır?', 'Mîkat', 'Nisap', 'Mihrap', 'Şavt', 'Mîkat, ihrama girme bakımından belirlenmiş yer veya zaman sınırıdır.'],
    ['Hangi uygulama hacda bulunur, umrenin parçası değildir?', 'Arafat vakfesi', 'İhrama girme', 'Kâbe’yi tavaf', 'Safâ ile Merve arasında sa‘y', 'Arafat vakfesi hacca özgüdür. Tavaf ve sa‘y umrede de yapılır.'],
    ['Zilhicce’nin 9. günü hac eğitiminde hangi adla anılır?', 'Arefe günü', 'Bayramın ilk günü', 'Teşrik günlerinin sonu', 'Ramazanın ilk günü', 'Arefe, zilhiccenin dokuzuncu günüdür ve Arafat vakfesiyle ilişkilidir.'],
  ]),
];
