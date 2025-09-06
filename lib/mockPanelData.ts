import type { PanelData } from '../types';

const getPlaceholderImageUrl = (panelNumber: number, text: string) => {
  const encodedText = encodeURIComponent(`NightRider\nPanel ${panelNumber}\n${text}`);
  return `https://placehold.co/1920x1080/000000/FFBF00/png?text=${encodedText}`;
};

export const mockPanelData: PanelData[] = [
  {
    text: "Słońce powoli wyłaniało się zza chmury pyłu, rozświetlając krajobraz w odcieniach rdzawej czerwieni i brudnej żółci. Ziemia była spękana, a na horyzoncie widać było ruiny dawnych miast.",
    imageUrl: getPlaceholderImageUrl(1, "Post-apokaliptyczny wschód słońca"),
    soundscape: "Cichy, świszczący wiatr przesuwa pył po spękanej ziemi.",
    chapter: 1
  },
  {
    text: "Tylko najtwardsi przetrwali, jak John, znany jako NightRider. Jego ciężarówka, Dominator, była legendą – potężną, opancerzoną maszyną gotową na każde wyzwanie.",
    imageUrl: getPlaceholderImageUrl(2, "NightRider i jego ciężarówka Dominator"),
    soundscape: "Głęboki, niski pomruk potężnego silnika diesla na jałowym biegu.",
    chapter: 1
  },
  {
    text: "W oddali dało się usłyszeć niski pomruk silnika. W jego kabinie John, z twarzą pełną determinacji, wpatrywał się w pustkowie. Nie był bohaterem. Był ocalałym.",
    imageUrl: getPlaceholderImageUrl(3, "John w kabinie Dominatora"),
    soundscape: "Monotonny warkot silnika ciężarówki, trzask statyczny z radia.",
    chapter: 2
  },
  {
    text: "Z głośników rozległ się syntetyczny głos: – Wszystkie systemy sprawne. Gotowy do drogi, John.",
    imageUrl: getPlaceholderImageUrl(4, "Podświetlona deska rozdzielcza"),
    soundscape: "Elektroniczny, spokojny głos z głośników, delikatne pikanie systemów.",
    chapter: 2
  },
  {
    text: "Brama fortecy zaskrzypiała, gdy mechaniczne ramiona zaczęły ją otwierać. Dominator wjechał na główny plac, rzucając cień na grupę mieszkańców.",
    imageUrl: getPlaceholderImageUrl(5, "Dominator wjeżdża do fortecy"),
    soundscape: "Zgrzyt ciężkiego metalu, stłumione głosy zaniepokojonych ludzi.",
    chapter: 3
  },
  {
    text: "Nagle tłum rozstąpił się, a zza niego wyszła kobieta. Jej oczy były pełne determinacji. - NightRider? – Jej głos brzmiał stanowczo, ale dało się w nim wyczuć ulgę.",
    imageUrl: getPlaceholderImageUrl(6, "Emma podchodzi do Johna"),
    soundscape: "Cichy szmer tłumu, kroki na piaszczystej ziemi.",
    chapter: 3
  },
  {
    text: "John spojrzał na Leo, którego wielkie, błyszczące oczy przypominały mu kogoś, kogo stracił dawno temu.",
    imageUrl: getPlaceholderImageUrl(7, "Zbliżenie na oczy Leo"),
    soundscape: "Cisza, w tle słychać jedynie odległy wiatr.",
    chapter: 3
  }
];

export const mockTranslatedPanelData: PanelData[] = [
  {
    text: "The sun was slowly emerging from behind a cloud of dust, illuminating the landscape in shades of rusty red and dirty yellow. The earth was cracked, and on the horizon, the ruins of former cities were visible.",
    imageUrl: getPlaceholderImageUrl(1, "Post-apocalyptic sunrise"),
    soundscape: "A quiet, whistling wind sweeps dust across the cracked earth.",
    chapter: 1
  },
  {
    text: "Only the toughest survived, like John, known as NightRider. His truck, the Dominator, was a legend – a powerful, armored machine ready for any challenge.",
    imageUrl: getPlaceholderImageUrl(2, "NightRider and his truck, the Dominator"),
    soundscape: "The deep, low rumble of a powerful diesel engine idling.",
    chapter: 1
  },
  {
    text: "In the distance, the low rumble of an engine could be heard. In his cabin, John, with a face full of determination, stared into the wasteland. He wasn't a hero. He was a survivor.",
    imageUrl: getPlaceholderImageUrl(3, "John in the Dominator's cabin"),
    soundscape: "The monotonous hum of the truck engine, static crackling from the radio.",
    chapter: 2
  },
  {
    text: "A synthetic voice came from the speakers: – All systems operational. Ready to go, John.",
    imageUrl: getPlaceholderImageUrl(4, "Illuminated dashboard"),
    soundscape: "A calm, electronic voice from the speakers, the gentle beeping of systems.",
    chapter: 2
  },
  {
    text: "The fortress gate creaked as mechanical arms began to open it. The Dominator drove onto the main square, casting a shadow over a group of residents.",
    imageUrl: getPlaceholderImageUrl(5, "The Dominator enters the fortress"),
    soundscape: "The grinding of heavy metal, the muffled voices of anxious people.",
    chapter: 3
  },
  {
    text: "Suddenly, the crowd parted, and a woman emerged. Her eyes were full of determination. 'NightRider?' Her voice was firm, but a sense of relief could be detected.",
    imageUrl: getPlaceholderImageUrl(6, "Emma approaches John"),
    soundscape: "A quiet murmur from the crowd, footsteps on the sandy ground.",
    chapter: 3
  },
  {
    text: "John looked at Leo, whose big, shiny eyes reminded him of someone he had lost long ago.",
    imageUrl: getPlaceholderImageUrl(7, "Close-up on Leo's eyes"),
    soundscape: "Silence, with only the distant wind audible in the background.",
    chapter: 3
  }
];
