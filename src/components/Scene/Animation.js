import { AnimationMixer } from "three";

/**
 * Updates animation-related data, is called in Scene when notified by GUI
 * @param {Object} data object passed from Scene
 * @param {Object} sceneState global scene state managed by VueX
 */
const updateAnimation = (data, sceneState) => {
  if (data.mixer) data.mixer.timeScale = sceneState.playbackSpeed;
};

/**
 * Set Scene's clips, if there are any clips - creates an animation mixer
 * @param {Object} data object passed from Scene
 * @param {Array<THREE.AnimationClip>} clips containing animations
 */
const setClips = (data, clips) => {
  if (data.mixer) {
    data.mixer.stopAllAction();
    data.mixer.uncacheRoot(data.mixer.getRoot());
    data.mixer = null;
  }

  data.clips = clips;
  if (!clips.length) return;

  data.mixer = new AnimationMixer(data.content);
};

/**
 * Resets and plays all of Scene's current clips
 * @param {Object} data object passed from Scene
 */
const playClips = (data) => {
  data.clips.forEach((clip) => {
    data.mixer.clipAction(clip).reset().play();
    // data.state.actionStates[clip.name] = true
  });
};

/**
 * Displays all animations, decides whether to show animation folder
 * @param {Object} data object passed from Scene
 */
const playAnimations = (data) => {
  // const actionStates = (data.state.actionStates = {})

  data.clips.forEach((clip, clipIndex) => {
    // Autoplay the first clip.
    let action;
    if (clipIndex === 0) {
      // actionStates[clip.name] = true
      action = data.mixer.clipAction(clip);
      action.play();
    } else {
      // actionStates[clip.name] = false
    }
  });
};

export default updateAnimation;

export { setClips, playClips, playAnimations };
