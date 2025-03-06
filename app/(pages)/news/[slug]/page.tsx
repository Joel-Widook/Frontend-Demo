import { fetchArticles, STRAPI_URL } from "@/app/lib/api";
import { Article, NewsParams } from "@/app/types";
import Image from "next/image";
import { notFound } from "next/navigation";

// Función para obtener los artículos (mantenemos la funcion async)
async function getArticles(): Promise<Article[]> {
  try {
    const articles = await fetchArticles();
    return articles;
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    notFound(); // Redirigir a la página 404 si hay un error
    return [];
  }
}

// Genera los parámetros estáticos para las rutas dinámicas (funcion async)
export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

// Esta funcion es asyncrona, y nos permitira realizar la logica que antes haciamos en News
async function getNewsArticle(params: NewsParams) {
    const articles = await getArticles();
    const newsArticle = articles.find((article) => article.slug === params.slug);

    if (!newsArticle) {
        notFound();
    }
    return {newsArticle, revalidate: 60};
}
//Ahora News es async de nuevo
export default async function News(props: any) {
    //usamos await para esperar a que termine la promesa y obtener el valor que necesitamos.
    const {newsArticle} = await getNewsArticle(props.params as NewsParams);

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
