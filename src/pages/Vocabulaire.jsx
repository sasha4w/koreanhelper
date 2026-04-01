import Section from "../components/Section";
import VocabCard from "../components/VocabCard";
import { vocabulaireSections } from "../data/vocabulaireData";

export default function Vocabulaire() {
  return (
    <>
      {vocabulaireSections.map((section, i) => (
        <Section key={i} title={section.title}>
          {section.cards.map((card, index) => (
            <VocabCard key={index} {...card} />
          ))}
        </Section>
      ))}
    </>
  );
}
