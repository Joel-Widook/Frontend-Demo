export interface Cover {
    url: string;
}

export interface NewsParams {
    slug: string;
}

export interface Article {
    id: string;
    title: string;
    description?: string;
    slug: string;
    cover: Cover;
    publishedAt: Date;
};

// Otras interfaces de tipos