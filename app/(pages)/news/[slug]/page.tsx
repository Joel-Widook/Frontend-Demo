import { fetchArticles, STRAPI_URL } from "@/app/lib/api";
import { Article, NewsParams } from "@/app/types";
import Image from "next/image";
import { notFound } from "next/navigation";

// build a list of the url parameters we need
let articles: Article[] = [];

  try {
    // Obtener los artículos dentro del componente
    articles = await fetchArticles();
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    notFound(); // Redirigir a la página 404 si hay un error
  }
  
export const generateStaticParams = () => {
    return articles.map(article => {
        return { slug: article.slug };
    });
};

// actually return the page content for this specific course

const News = ({ params } : { params: NewsParams }) => {

    const newsArticle = articles.filter(article => {
        return article.slug === params.slug;
    })[0];

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <Image 
                className="w-full h-48 object-cover"
                src={STRAPI_URL + newsArticle.cover.url}
                alt={newsArticle.title}
                width={180}
                height={38}
                priority
            />
            <div className="p-4">
                <h3 className="text-lg font-bold mb-2 text-gray-500">{newsArticle.title}</h3>
                <p className="text-gray-600 mb-4">{newsArticle.description}</p>
            </div>
        </div>
    );
};

export default News;