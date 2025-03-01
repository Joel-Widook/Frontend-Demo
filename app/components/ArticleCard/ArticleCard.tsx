import Image from "next/image";
import { Article } from "../../types";
import { STRAPI_URL } from "../../lib/api";
import { formatDate } from "../../lib/formatDate";

export const ArticleCard = ({ article }: { article: Article}) => {
    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <Image 
                className="w-full h-48 object-cover"
                src={STRAPI_URL + article.cover.url}
                alt={article.title}
                width={180}
                height={38}
                priority
            />
            <div className="p-4">
            <h3 className="text-lg font-bold mb-2 text-gray-500">{article.title}</h3>
            <p className="text-gray-600 mb-4">{article.content}</p>
            <p className="text-sm text-gray-500">Published: {formatDate(article.publishedAt)}</p>
            </div>
        </div>
    )
}