import type { PanelData } from '../types';

const getPlaceholderImageUrl = (panelNumber: number, text: string) => {
  const encodedText = encodeURIComponent(`NightRider\nPanel ${panelNumber}\n${text.replace(/-/g, '')}`);
  return `https://placehold.co/1920x1080/000000/FFBF00/png?text=${encodedText}`;
};

export const mockPanelData: PanelData[] = [
  // Rozdział 1
  {
    text: "Słońce powoli wyłaniało się zza chmury pyłu, rozświetlając krajobraz w odcieniach rdzawej czerwieni i brudnej żółci. Ziemia była spękana, a na horyzoncie widać było ruiny dawnych miast.",
    imageUrl: getPlaceholderImageUrl(1, "Post-apokaliptyczny wschód słońca"),
    soundscape: "dawn",
    chapter: 1,
    speakerGender: 'narrator'
  },
  {
    text: "Tylko najtwardsi przetrwali, jak John, znany jako NightRider. Jego ciężarówka, Dominator, była legendą – potężną, opancerzoną maszyną gotową na każde wyzwanie.",
    imageUrl: getPlaceholderImageUrl(2, "NightRider i jego ciężarówka Dominator"),
    soundscape: "Głęboki, niski pomruk potężnego silnika diesla na jałowym biegu.",
    chapter: 1,
    speakerGender: 'narrator'
  },
  // Rozdział 2
  {
    text: "W oddali dało się usłyszeć niski pomruk silnika. W jego kabinie John, z twarzą pełną determinacji, wpatrywał się w pustkowie. Nie był bohaterem. Był ocalałym.",
    imageUrl: getPlaceholderImageUrl(3, "John w kabinie Dominatora"),
    soundscape: "Monotonny warkot silnika ciężarówki, trzask statyczny z radia.",
    chapter: 2,
    speakerGender: 'narrator'
  },
  {
    text: "Z głośników rozległ się syntetyczny głos: – Wszystkie systemy sprawne. Gotowy do drogi, John.",
    imageUrl: getPlaceholderImageUrl(4, "Podświetlona deska rozdzielcza"),
    soundscape: "Elektroniczny, spokojny głos z głośników, delikatne pikanie systemów.",
    chapter: 2,
    speakerGender: 'machine'
  },
  {
    text: "- Dzięki, przyjacielu – odpowiedział John. – Miejmy nadzieję, że dziś obejdzie się bez większych komplikacji.",
    imageUrl: getPlaceholderImageUrl(5, "John siada za kierownicą"),
    soundscape: "Dźwięk siadania na skórzanym fotelu, delikatny pomruk silnika.",
    chapter: 2,
    speakerGender: 'male'
  },
  // Rozdział 3
  {
    text: "Brama fortecy zaskrzypiała, gdy mechaniczne ramiona zaczęły ją otwierać. Dominator wjechał na główny plac, rzucając cień na grupę mieszkańców.",
    imageUrl: getPlaceholderImageUrl(6, "Dominator wjeżdża do fortecy"),
    soundscape: "Zgrzyt ciężkiego metalu, stłumione głosy zaniepokojonych ludzi.",
    chapter: 3,
    speakerGender: 'narrator'
  },
  {
    text: "Nagle tłum rozstąpił się, a zza niego wyszła kobieta. - NightRider? – Jej głos brzmiał stanowczo, ale dało się w nim wyczuć ulgę.",
    imageUrl: getPlaceholderImageUrl(7, "Emma podchodzi do Johna"),
    soundscape: "Cichy szmer tłumu, kroki na piaszczystej ziemi.",
    chapter: 3,
    speakerGender: 'female'
  },
  {
    text: "- A to mój syn, Leo. Potrzebujemy twojej pomocy.",
    imageUrl: getPlaceholderImageUrl(8, "Emma wskazuje na Leo"),
    soundscape: "Głos kobiety, w tle słychać cichy płacz dziecka.",
    chapter: 3,
    speakerGender: 'female'
  },
  {
    text: "- Proszę, panie NightRider. Moja mama mówi, że jest pan bohaterem.",
    imageUrl: getPlaceholderImageUrl(9, "Zbliżenie na oczy Leo"),
    soundscape: "Dziecięcy, błagalny głos, w tle cisza.",
    chapter: 3,
    speakerGender: 'male'
  },
  // Rozdział 4
  {
    text: "Warsztat Damiano był sercem technologicznej innowacji. Obok niego kręcił się El Diablo – robo-pies, którego ślepia jarzyły się czerwonym światłem.",
    imageUrl: getPlaceholderImageUrl(10, "Warsztat Damiano z El Diablo"),
    soundscape: "Dźwięki spawania, uderzenia młota, elektroniczne szczeknięcie.",
    chapter: 4,
    speakerGender: 'narrator'
  },
  {
    text: "- John! – wykrzyknął Damiano, odkładając narzędzia. – Jak zwykle punktualny.",
    imageUrl: getPlaceholderImageUrl(11, "Uśmiechnięty Damiano wita Johna"),
    soundscape: "Radosny męski głos, brzęk odkładanych metalowych narzędzi.",
    chapter: 4,
    speakerGender: 'male'
  },
  {
    text: "- Pasażerowie – wyjaśnił John. – Przy okazji, potrzebuję, żebyś rzucił okiem na system komunikacyjny Dominatora.",
    imageUrl: getPlaceholderImageUrl(12, "John wskazuje na Emmę i Leo"),
    soundscape: "Spokojny, rzeczowy głos Johna, w tle warkot silnika.",
    chapter: 4,
    speakerGender: 'male'
  },
  {
    text: "- Czy on naprawdę wie, co robi? – zapytał chłopiec, wskazując na El Diablo.",
    imageUrl: getPlaceholderImageUrl(13, "Leo zafascynowany El Diablo"),
    soundscape: "Ciekawski głos dziecka, mechaniczne skomlenie robota.",
    chapter: 4,
    speakerGender: 'male'
  },
  // Rozdział 5
  {
      text: "El Diablo nagle podniósł głowę. Jego mechaniczne ślepia zaświeciły się na czerwono.",
      imageUrl: getPlaceholderImageUrl(14, "El Diablo w pozycji alarmowej"),
      soundscape: "Nagła cisza, przerywana cichym, elektronicznym buczeniem.",
      chapter: 5,
      speakerGender: "narrator"
  },
  {
      text: "- Analiza zbliżającego się zagrożenia – odpowiedział El Diablo swoim syntetycznym głosem. – Brak potwierdzenia, ale zalecam ostrożność.",
      imageUrl: getPlaceholderImageUrl(15, "Czerwone oczy El Diablo"),
      soundscape: "Zniekształcony, syntetyczny głos, trzaski statyczne.",
      chapter: 5,
      speakerGender: "machine"
  },
  {
      text: "- Coś się dzieje?",
      imageUrl: getPlaceholderImageUrl(16, "Zaniepokojona twarz Emmy"),
      soundscape: "Zaniepokojony szept kobiety.",
      chapter: 5,
      speakerGender: "female"
  },
  {
      text: "- Jeszcze nie, ale lepiej być gotowym – odpowiedział John. – Damiano, zabezpiecz bramę.",
      imageUrl: getPlaceholderImageUrl(17, "John wydaje polecenia"),
      soundscape: "Zdecydowany, niski głos męski, dźwięk przeładowywanej broni.",
      chapter: 5,
      speakerGender: "male"
  }
];

export const mockTranslatedPanelData: PanelData[] = [
  // Chapter 1
  {
    text: "The sun was slowly emerging from behind a cloud of dust, illuminating the landscape in shades of rusty red and dirty yellow. The earth was cracked, and on the horizon, the ruins of former cities were visible.",
    imageUrl: getPlaceholderImageUrl(1, "Post-apocalyptic sunrise"),
    soundscape: "dawn",
    chapter: 1,
    speakerGender: 'narrator'
  },
  {
    text: "Only the toughest survived, like John, known as NightRider. His truck, the Dominator, was a legend – a powerful, armored machine ready for any challenge.",
    imageUrl: getPlaceholderImageUrl(2, "NightRider and his truck, the Dominator"),
    soundscape: "The deep, low rumble of a powerful diesel engine idling.",
    chapter: 1,
    speakerGender: 'narrator'
  },
  // Chapter 2
  {
    text: "In the distance, the low rumble of an engine could be heard. In his cabin, John, with a face full of determination, stared into the wasteland. He wasn't a hero. He was a survivor.",
    imageUrl: getPlaceholderImageUrl(3, "John in the Dominator's cabin"),
    soundscape: "The monotonous hum of the truck engine, static crackling from the radio.",
    chapter: 2,
    speakerGender: 'narrator'
  },
  {
    text: "A synthetic voice came from the speakers: – All systems operational. Ready to go, John.",
    imageUrl: getPlaceholderImageUrl(4, "Illuminated dashboard"),
    soundscape: "A calm, electronic voice from the speakers, the gentle beeping of systems.",
    chapter: 2,
    speakerGender: 'machine'
  },
  {
    text: "- Thanks, pal – John replied. – Let's hope today goes without any major complications.",
    imageUrl: getPlaceholderImageUrl(5, "John sits at the wheel"),
    soundscape: "The sound of sitting on a leather seat, a gentle engine rumble.",
    chapter: 2,
    speakerGender: 'male'
  },
  // Chapter 3
  {
    text: "The fortress gate creaked as mechanical arms began to open it. The Dominator drove onto the main square, casting a shadow over a group of residents.",
    imageUrl: getPlaceholderImageUrl(6, "The Dominator enters the fortress"),
    soundscape: "The grinding of heavy metal, the muffled voices of anxious people.",
    chapter: 3,
    speakerGender: 'narrator'
  },
  {
    text: "Suddenly, the crowd parted, and a woman emerged. 'NightRider?' Her voice was firm, but a sense of relief could be detected.",
    imageUrl: getPlaceholderImageUrl(7, "Emma approaches John"),
    soundscape: "A quiet murmur from the crowd, footsteps on the sandy ground.",
    chapter: 3,
    speakerGender: 'female'
  },
  {
    text: "- And this is my son, Leo. We need your help.",
    imageUrl: getPlaceholderImageUrl(8, "Emma points to Leo"),
    soundscape: "A woman's voice, a child's quiet cry in the background.",
    chapter: 3,
    speakerGender: 'female'
  },
  {
    text: "- Please, Mr. NightRider. My mom says you're a hero.",
    imageUrl: getPlaceholderImageUrl(9, "Close-up on Leo's eyes"),
    soundscape: "A child's pleading voice, silence in the background.",
    chapter: 3,
    speakerGender: 'male'
  },
  // Chapter 4
  {
    text: "Damiano's workshop was the heart of technological innovation. Next to him was El Diablo – a robo-dog whose eyes glowed with a red light.",
    imageUrl: getPlaceholderImageUrl(10, "Damiano's workshop with El Diablo"),
    soundscape: "Sounds of welding, hammer strikes, an electronic bark.",
    chapter: 4,
    speakerGender: 'narrator'
  },
  {
    text: "- John! – Damiano exclaimed, putting down his tools. – Punctual as always.",
    imageUrl: getPlaceholderImageUrl(11, "A smiling Damiano greets John"),
    soundscape: "A cheerful male voice, the clatter of metal tools being set down.",
    chapter: 4,
    speakerGender: 'male'
  },
  {
    text: "- Passengers – John explained. – By the way, I need you to take a look at the Dominator's communication system.",
    imageUrl: getPlaceholderImageUrl(12, "John points towards Emma and Leo"),
    soundscape: "John's calm, matter-of-fact voice, with the engine rumbling in the background.",
    chapter: 4,
    speakerGender: 'male'
  },
  {
    text: "- Does he really know what he's doing? – the boy asked, pointing at El Diablo.",
    imageUrl: getPlaceholderImageUrl(13, "Leo fascinated by El Diablo"),
    soundscape: "A child's curious voice, the mechanical whimper of a robot.",
    chapter: 4,
    speakerGender: 'male'
  },
  // Chapter 5
  {
      text: "El Diablo suddenly raised his head. His mechanical eyes glowed red.",
      imageUrl: getPlaceholderImageUrl(14, "El Diablo in an alert position"),
      soundscape: "Sudden silence, broken by a quiet, electronic hum.",
      chapter: 5,
      speakerGender: "narrator"
  },
  {
      text: "- Analysis of approaching threat – El Diablo replied in its synthetic voice. – No confirmation, but I recommend caution.",
      imageUrl: getPlaceholderImageUrl(15, "El Diablo's red eyes"),
      soundscape: "A distorted, synthetic voice, static crackles.",
      chapter: 5,
      speakerGender: "machine"
  },
  {
      text: "- Is something happening?",
      imageUrl: getPlaceholderImageUrl(16, "Emma's concerned face"),
      soundscape: "A woman's worried whisper.",
      chapter: 5,
      speakerGender: "female"
  },
  {
      text: "- Not yet, but it's better to be ready – John answered. – Damiano, secure the gate.",
      imageUrl: getPlaceholderImageUrl(17, "John giving commands"),
      soundscape: "A determined, low male voice, the sound of a weapon being loaded.",
      chapter: 5,
      speakerGender: "male"
  }
];