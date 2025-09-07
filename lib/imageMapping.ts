// This map connects the conceptual 'imagePrompt' from the panel generation
// to a specific, direct-download Google Drive URL provided by the user.

const imageDatabase: { [key: string]: string } = {
  // Rozdział 1
  "Post-apokaliptyczny wschód słońca": "https://drive.google.com/uc?export=download&id=1_R82R-5YrmuQ1gY8Z3f3Yq2z_X7yF4jW",
  "NightRider i jego ciężarówka Dominator": "https://drive.google.com/uc?export=download&id=1-1yq_b7hQZJ3n5t4X_c_G7jL_X9zR6yK",
  // Rozdział 2
  "John w kabinie Dominatora": "https://drive.google.com/uc?export=download&id=1-F_jO3d1vX8Z_8k_N5zL_Q2mK_Z7jP8e",
  "Podświetlona deska rozdzielcza": "https://drive.google.com/uc?export=download&id=1-hT_R7tW_y_z_i_K8hY9J_b-J_kL6rV3",
  // NOTE: The following entries had invalid placeholder URLs and have been removed.
  // The app will now correctly generate a placeholder image until valid URLs are provided.
};

/**
 * Finds the corresponding image URL for a given panel's conceptual prompt.
 * Falls back to null if no image is found in the database, signaling that
 * a new image should be generated.
 * @param chapter - The chapter number (for context).
 * @param imagePrompt - The conceptual prompt key from the panel data.
 * @returns The final image URL or null if not found.
 */
export const getImageUrlForPanel = (chapter: number, imagePrompt: string): string | null => {
  const promptKey = Object.keys(imageDatabase).find(key => imagePrompt.toLowerCase().includes(key.toLowerCase()));
  
  if (promptKey && imageDatabase[promptKey]) {
    return imageDatabase[promptKey];
  }

  console.warn(`No image found in database for prompt: "${imagePrompt}" in chapter ${chapter}. Will generate new image.`);
  return null;
};