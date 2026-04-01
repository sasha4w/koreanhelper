import Section from "../components/Section";
import Card from "../components/Card";
import { verbesSections } from "../data/verbesData";

export default function Verbes() {
  return (
    <>
      {verbesSections.map((section, i) => (
        <Section key={i} title={section.title}>
          {section.cards.map((card, index) => (
            <Card key={index} {...card} />
          ))}
        </Section>
      ))}
    </>
  );
}
