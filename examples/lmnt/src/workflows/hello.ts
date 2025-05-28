import { log, step } from "@restackio/ai/workflow";
import * as functions from "../functions";

interface Input {
  name: string;
}

export async function helloWorkflow({ name }: Input) {
  const text: { [key: string]: string } = {
    en: `Hello ${name}. It's a pleasure to meet you.`,
    es: `Hola ${name}. Es un placer conocerte.`,
    fr: `Bonjour ${name}. C'est un plaisir de vous rencontrer.`,
    de: `Hallo ${name}. Es ist mir eine Freude, Sie kennenzulernen.`,
    pt: `Olá ${name}. É um prazer conhecê-lo.`,
    zh: `你好 ${name}。很高兴见到你。`,
    ko: `안녕하세요 ${name}. 만나서 반갑습니다.`,
    hi: `नमस्ते ${name}. आपसे मिलकर खुशी हुई।`
  };
  const voice = "morgan";

  const languages = ["en", "es", "fr", "de", "pt", "zh", "ko", "hi"];
  const lmntOutputPromises = languages.map(lang => {
    const filename = `hello_${lang}_${voice}.mp3`;
    return step<typeof functions>({
      taskQueue: "lmnt",
    }).lmntSynthesize(text[lang], voice, filename, {
      format: "mp3",
      language: lang,
    });
  });

  const lmntOutput = await Promise.all(lmntOutputPromises);

  log.info("lmntOutput:", { lmntOutput });

  return {
    success: true,
  };
}