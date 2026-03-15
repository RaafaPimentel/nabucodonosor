import { CurrentsProvider } from "@/providers/currents-provider";
import { GNewsProvider } from "@/providers/gnews-provider";
import { NewsApiProvider } from "@/providers/newsapi-provider";
import { NewsCatcherProvider } from "@/providers/newscatcher-provider";

export function getProviders() {
  return [
    new GNewsProvider(),
    new NewsApiProvider(),
    new NewsCatcherProvider(),
    new CurrentsProvider()
  ];
}
