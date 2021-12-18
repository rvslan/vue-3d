import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";

export default createStore({
  state: {
    // 3D Viewer
    showModelInfo: false,

    // File loading
    fileURL: "",
    fileType: "",
    sceneState: "",

    // Loaded model information
    modelInfo: {},
  },
  mutations: {
    SET: (state, { key, value }) => (state[key] = value),
    SAVE_FILE_DATA: (state, { fileURL, fileType }) => {
      state.fileURL = fileURL;
      state.fileType = fileType;
    },
  },
  actions: {
    saveFileData({ commit }, fileData) {
      console.log("~~~ Saving file data to global state...");
      commit("SAVE_FILE_DATA", fileData);
    },
  },
  modules: {},
  plugins: [createPersistedState()],
});
