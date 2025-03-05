import { ArticleCard } from "./components/ArticleCard/ArticleCard";
import { fetchArticles } from "./lib/api";
import { Article } from "./types";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  let articles: Article[] = [];

  try {
    // Obtener los artículos dentro del componente
    articles = await fetchArticles();
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    notFound(); // Redirigir a la página 404 si hay un error
  }

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-4">Next.js and Strapi Integration</h1>
      <h2><Link className="text-md underline" href="/example">Second page</Link></h2>
      <div>
        <h2 className="text-2xl font-semibold mt-6 mb-6">Articles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </div>
  );

}