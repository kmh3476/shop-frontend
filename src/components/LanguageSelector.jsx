import { Select } from "antd";
import i18n from "../i18n";

export default function LanguageSelector() {
  return (
    <Select
      defaultValue={i18n.language}
      onChange={(lang) => i18n.changeLanguage(lang)}
      options={[
        { value: "ko", label: "한국어" },
        { value: "en", label: "English" },
        { value: "th", label: "ไทย" },
      ]}
      style={{ width: 120 }}
    />
  );
}
