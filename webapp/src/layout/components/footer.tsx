import { link } from "fs";

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
    <div className="flex w-full justify-center items-center py-3 px-4 pb-7">
      <div className="flex gap-6">
        {items.map((item) => {
          return (
            <a
              href={item.link}
              key={item.label}
              className="text-sm text-midnight-gray-600 leading-5 tracking-[-0.09px]"
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
