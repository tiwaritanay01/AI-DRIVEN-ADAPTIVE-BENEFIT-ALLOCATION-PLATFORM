import { newsItems } from "@/data/mockData";

const NewsTicker = () => (
  <div
    className="bg-gov-navy text-white overflow-hidden py-2"
    role="marquee"
    aria-live="polite"
    aria-label="Latest government news and updates"
  >
    <div className="flex items-center">
      <span className="bg-gov-saffron text-white px-3 py-1 text-xs font-bold uppercase shrink-0 mr-4 rounded-r">
        News
      </span>
      <div className="overflow-hidden flex-1">
        <div className="animate-ticker whitespace-nowrap">
          {newsItems.map((item, i) => (
            <span key={i} className="mx-8 text-sm">
              📌 {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default NewsTicker;
