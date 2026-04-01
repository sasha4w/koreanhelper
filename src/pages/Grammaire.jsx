import Section from "../components/Section";
import Card from "../components/Card";
import { grammairesSections } from "../data/grammaireData";

export default function Grammaire() {
  return (
    <>
      {grammairesSections.map((section, i) => (
        <Section key={i} title={section.title}>
          {section.cards.map((card, index) => (
            <Card key={index} {...card} />
          ))}
        </Section>
      ))}
    </>
  );
}
