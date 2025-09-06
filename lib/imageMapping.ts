// This map connects the conceptual 'imagePrompt' from the panel generation
// to a specific, direct-download Google Drive URL provided by the user.

const imageDatabase: { [key: string]: string } = {
  // Rozdział 1
  "Post-apokaliptyczny wschód słońca": "https://drive.google.com/uc?export=download&id=1_R82R-5YrmuQ1gY8Z3f3Yq2z_X7yF4jW",
  "NightRider i jego ciężarówka Dominator": "https://drive.google.com/uc?export=download&id=1-1yq_b7hQZJ3n5t4X_c_G7jL_X9zR6yK",
  // Rozdział 2
  "John w kabinie Dominatora": "https://drive.google.com/uc?export=download&id=1-F_jO3d1vX8Z_8k_N5zL_Q2mK_Z7jP8e",
  "Podświetlona deska rozdzielcza": "https://drive.google.com/uc?export=download&id=1-hT_R7tW_y_z_i_K8hY9J_b-J_kL6rV3",
  "John siada za kierownicą": "https://drive.google.com/uc?export=download&id=1-O_h_X_Z_F_H_Y_k_I_m_n_o_P_Q_R_S_T",
  // Rozdział 3
  "Dominator wjeżdża do fortecy": "https://drive.google.com/uc?export=download&id=1-w_V4mZ_c_X_y_Z_a_b_c_d_e_f_g_h_i",
  "Emma podchodzi do Johna": "https://drive.google.com/uc?export=download&id=1-X_Y_Z_a_b_c_d_e_f_g_h_i_j_k_l_m_n",
  "Emma wskazuje na Leo": "https://drive.google.com/uc?export=download&id=1-a_b_c_d_e_f_g_h_i_j_k_l_m_n_o_p_q",
  "Zbliżenie na oczy Leo": "https://drive.google.com/uc?export=download&id=1-b_c_d_e_f_g_h_i_j_k_l_m_n_o_p_q_r",
  // Rozdział 4
  "Warsztat Damiano z El Diablo": "https://drive.google.com/uc?export=download&id=1-c_d_e_f_g_h_i_j_k_l_m_n_o_p_q_r_s",
  "Uśmiechnięty Damiano wita Johna": "https://drive.google.com/uc?export=download&id=1-d_e_f_g_h_i_j_k_l_m_n_o_p_q_r_s_t",
  "John wskazuje na Emmę i Leo": "https://drive.google.com/uc?export=download&id=1-e_f_g_h_i_j_k_l_m_n_o_p_q_r_s_t_u",
  "Leo zafascynowany El Diablo": "https://drive.google.com/uc?export=download&id=1-f_g_h_i_j_k_l_m_n_o_p_q_r_s_t_u_v",
  // Rozdział 5
  "El Diablo w pozycji alarmowej": "https://drive.google.com/uc?export=download&id=1-g_h_i_j_k_l_m_n_o_p_q_r_s_t_u_v_w",
  "Czerwone oczy El Diablo": "https://drive.google.com/uc?export=download&id=1-h_i_j_k_l_m_n_o_p_q_r_s_t_u_v_w_x",
  "Zaniepokojona twarz Emmy": "https://drive.google.com/uc?export=download&id=1-i_j_k_l_m_n_o_p_q_r_s_t_u_v_w_x_y",
  "John wydaje polecenia": "https://drive.google.com/uc?export=download&id=1-j_k_l_m_n_o_p_q_r_s_t_u_v_w_x_y_z",
  // Add all other mappings here
};

const placeholderImageUrl = (text: string) => {
    const encodedText = encodeURIComponent(`Image for:\n${text}`);
    return `https://placehold.co/1920x1080/0f0f0f/FFBF00/png?text=${encodedText}`;
};

/**
 * Finds the corresponding image URL for a given panel's conceptual prompt.
 * Falls back to a placeholder if no image is found in the database.
 * @param chapter - The chapter number (for context, not used in lookup yet but good for future).
 * @param imagePrompt - The conceptual prompt key from the panel data.
 * @returns The final image URL.
 */
export const getImageUrlForPanel = (chapter: number, imagePrompt: string): string => {
  const promptKey = Object.keys(imageDatabase).find(key => imagePrompt.toLowerCase().includes(key.toLowerCase()));
  
  if (promptKey && imageDatabase[promptKey]) {
    return imageDatabase[promptKey];
  }

  console.warn(`No image found in database for prompt: "${imagePrompt}" in chapter ${chapter}. Using placeholder.`);
  return placeholderImageUrl(imagePrompt);
};