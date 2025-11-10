export default function Footer() {
  const items = [
    {
      label: "2025 @ Delta Sign",
      link: "#",
    },
    {
      label: "Privacy Policy",
      link: "#",
    },
    {
      label: "Terms and Conditions",
      link: "#",
    },
  ];

  return (
    <div className="flex w-full items-center justify-center px-4 py-3 pb-7">
      <div className="flex gap-6">
        {items.map((item) => {
          return (
            <a
              href={item.link}
              key={item.label}
              className="text-midnight-gray-600 text-sm leading-5 tracking-[-0.09px]"
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
