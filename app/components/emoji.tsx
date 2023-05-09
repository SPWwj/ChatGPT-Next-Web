import EmojiPicker, {
  Emoji,
  EmojiStyle,
  Theme as EmojiTheme,
} from "emoji-picker-react";

import { ModelType } from "../store";
import styles from "./emoji.module.scss";
import BotIcon from "../icons/bot.svg";
import BlackBotIcon from "../icons/black-bot.svg";
import SpeakerIcon from "../icons/speaker.svg";
import { useCallback, useEffect, useState } from "react";
import { franc } from "franc";

export function getEmojiUrl(unified: string, style: EmojiStyle) {
  return `https://cdn.staticfile.org/emoji-datasource-apple/14.0.0/img/${style}/64/${unified}.png`;
}

export function AvatarPicker(props: {
  onEmojiClick: (emojiId: string) => void;
}) {
  return (
    <EmojiPicker
      lazyLoadEmojis
      theme={EmojiTheme.AUTO}
      getEmojiUrl={getEmojiUrl}
      onEmojiClick={(e) => {
        props.onEmojiClick(e.unified);
      }}
    />
  );
}
type LanguageCodeMapping = {
  [key: string]: string;
};

const languageCodeMapping: LanguageCodeMapping = {
  cmn: "zh-CN",
  // Add other mappings if necessary
};
export function Avatar(props: {
  model?: ModelType;
  avatar?: string;
  className?: string;
  text?: string;
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const synth = window.speechSynthesis;

  const speakText = useCallback(() => {
    if (!props.text) return;
    synth.cancel();

    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
    } else {
      // Detect language using franc
      let detectedLanguage = franc(props.text);
      const availableVoices = synth.getVoices();
      detectedLanguage =
        languageCodeMapping[detectedLanguage] || detectedLanguage;

      console.log(detectedLanguage, "detectedLanguage");
      if (detectedLanguage === "und") {
        // If the detected language is undetermined, check if it's Simplified Chinese using a regex
        const simplifiedChineseRegex = /[\u4E00-\u9FFF]+/;
        if (simplifiedChineseRegex.test(props.text)) {
          console.log("Detected Simplified Chinese");
          detectedLanguage = "zh-CN";
        } else {
          // Fallback to English if detection fails
          detectedLanguage = "en";
        }
      } else {
        detectedLanguage = detectedLanguage;
      }

      const matchingVoice = availableVoices.find((voice) =>
        voice.lang.startsWith(detectedLanguage),
      );

      const utterance = new SpeechSynthesisUtterance(props.text);
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      } else {
        console.warn(
          `No voice available for language ${detectedLanguage}. Falling back to the default voice.`,
        );
      }

      synth.speak(utterance);
      setIsSpeaking(true);
      window.dispatchEvent(new CustomEvent("startSpeaking"));

      utterance.onend = () => {
        setIsSpeaking(false);
      };
    }
  }, [props.text, isSpeaking, synth]);

  useEffect(() => {
    const handleStartSpeaking = () => {
      if (isSpeaking) {
        setIsSpeaking(false);
      }
    };

    window.addEventListener("startSpeaking", handleStartSpeaking);
    return () => {
      window.removeEventListener("startSpeaking", handleStartSpeaking);
    };
  }, [isSpeaking, synth]);
  const speakerIconClassNames = [
    styles.speakerIcon,
    isSpeaking ? styles.pulsating : "",
    props.className === "user-speaker" ? "user-speaker" : "",
  ].join(" ");

  if (props.model) {
    return (
      <div className={styles.noDark} onClick={speakText}>
        {props.model?.startsWith("gpt-4") ? (
          <div
            className={`user-avatar${
              props.className ? " " + props.className : ""
            }`}
            onClick={speakText}
          >
            <BlackBotIcon />{" "}
            {props.text && (
              <div className={styles.speakerContainer}>
                <SpeakerIcon className={speakerIconClassNames} />
              </div>
            )}
          </div>
        ) : (
          <div
            className={`user-avatar${
              props.className ? " " + props.className : ""
            }`}
            onClick={speakText}
          >
            <BotIcon />
            {props.text && (
              <div className={styles.speakerContainer}>
                <SpeakerIcon className={speakerIconClassNames} />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`user-avatar${props.className ? " " + props.className : ""}`}
      onClick={speakText}
    >
      <EmojiAvatar avatar={props.avatar!} />{" "}
      {props.text && (
        <div className={styles.speakerContainer}>
          <SpeakerIcon className={speakerIconClassNames} />
        </div>
      )}
    </div>
  );
}
export function EmojiAvatar(props: { avatar: string; size?: number }) {
  return (
    <Emoji
      unified={props.avatar}
      size={props.size ?? 18}
      getEmojiUrl={getEmojiUrl}
    />
  );
}
