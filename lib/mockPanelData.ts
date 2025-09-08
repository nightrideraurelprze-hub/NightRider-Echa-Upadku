import type { PanelData } from '../types';

// This file now contains the condensed data for the 3-chapter demo.
// Each object represents a full chapter.

export const mockPanelData: PanelData[] = [
  // Chapter 1
  {
    text: "Słońce powoli wyłaniało się zza chmury pyłu, rozświetlając ruiny dawnych miast. Tylko najtwardsi przetrwali, jak John, znany jako NightRider. Jego ciężarówka, Dominator, była legendą – potężną, opancerzoną maszyną gotową na każde wyzwanie.",
    imageUrl: "https://drive.google.com/uc?export=download&id=1-1yq_b7hQZJ3n5t4X_c_G7jL_X9zR6yK", // NightRider and Dominator
    soundscape: "Głęboki, niski pomruk potężnego silnika diesla.",
    chapter: 1,
    speakerGender: 'narrator'
  },
  // Chapter 2
  {
    text: "W jego kabinie John, z twarzą pełną determinacji, wpatrywał się w pustkowie. Nie był bohaterem. Był ocalałym. Z głośników rozległ się syntetyczny głos: – Wszystkie systemy sprawne. Gotowy do drogi, John.",
    imageUrl: "https://drive.google.com/uc?export=download&id=1-F_jO3d1vX8Z_8k_N5zL_Q2mK_Z7jP8e", // John in cabin
    soundscape: "Monotonny warkot silnika ciężarówki, trzask statyczny z radia.",
    chapter: 2,
    speakerGender: 'narrator'
  },
  // Chapter 3
  {
    text: "Brama fortecy zaskrzypiała, gdy Dominator wjechał na główny plac. Z tłumu wyszła kobieta. - NightRider? – Jej głos brzmiał stanowczo. - A to mój syn, Leo. Potrzebujemy twojej pomocy.",
    imageUrl: "https://drive.google.com/uc?export=download&id=1Uf7VuIVh8RC_3YcfVPjbI-KYdWHxwVRt", // Ruins (representing the fortress)
    soundscape: "Zgrzyt ciężkiego metalu, stłumione głosy zaniepokojonych ludzi.",
    chapter: 3,
    speakerGender: 'narrator'
  },
];

export const mockTranslatedPanelData: PanelData[] = [
  // Chapter 1
  {
    text: "The sun was slowly emerging from behind a cloud of dust, illuminating the ruins of former cities. Only the toughest survived, like John, known as NightRider. His truck, the Dominator, was a legend – a powerful, armored machine ready for any challenge.",
    imageUrl: "https://drive.google.com/uc?export=download&id=1-1yq_b7hQZJ3n5t4X_c_G7jL_X9zR6yK",
    soundscape: "The deep, low rumble of a powerful diesel engine.",
    chapter: 1,
    speakerGender: 'narrator'
  },
  // Chapter 2
  {
    text: "In his cabin, John, with a face full of determination, stared into the wasteland. He wasn't a hero. He was a survivor. A synthetic voice came from the speakers: – All systems operational. Ready to go, John.",
    imageUrl: "https://drive.google.com/uc?export=download&id=1-F_jO3d1vX8Z_8k_N5zL_Q2mK_Z7jP8e",
    soundscape: "The monotonous hum of the truck engine, static crackling from the radio.",
    chapter: 2,
    speakerGender: 'narrator'
  },
  // Chapter 3
  {
    text: "The fortress gate creaked as the Dominator drove onto the main square. A woman emerged from the crowd. 'NightRider?' Her voice was firm. 'And this is my son, Leo. We need your help.'",
    imageUrl: "https://drive.google.com/uc?export=download&id=1Uf7VuIVh8RC_3YcfVPjbI-KYdWHxwVRt",
    soundscape: "The grinding of heavy metal, the muffled voices of anxious people.",
    chapter: 3,
    speakerGender: 'narrator'
  },
];