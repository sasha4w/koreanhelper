export default function Section({ title, children }) {
  return (
    <>
      <p className="section-title">{title}</p>
      <div className="grid">{children}</div>
    </>
  );
}
