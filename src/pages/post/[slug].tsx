import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { formatDate } from '../../services/formatDate';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({post}: PostProps) {
  
  const router = useRouter();
  if (router.isFallback) {
    return 'Carregando...';
  }

  const [readTime, setReadTime] = useState(0);

  useEffect(() => {

    const text = post.data.content.reduce((text, currentText) => {
      return text += `${currentText.heading} ${RichText.asText(currentText.body)} `;
    }, '');

    const wordAmount = text.split(' ').length;
    setReadTime(Math.ceil(wordAmount / 200));
  }, []);
  




   // TODO
   return (
    <>
      <img src={post.data.banner.url} alt="Banner" className={styles.banner} />
      <main className={commonStyles.content}>
          <div className={styles.posts}>
            <h1>{post.data.title}</h1>
            <div className={styles.info}>
              <time><FiCalendar /> {formatDate(post.first_publication_date)}</time>
              <span><FiUser /> {post.data.author}</span>
              <span><FiClock /> {readTime} min</span>
            </div>
            <article>
              {post.data.content.map((paragraph) => {
                return (
                  <div key={paragraph.heading.replace(' ', '-')}>
                    <h2>{paragraph.heading}</h2>
                    <div dangerouslySetInnerHTML={{__html: RichText.asHtml(paragraph.body)}}></div>
                  </div>
                )
              })}
            </article>
          </div>
      </main>
    </>
   )
}

export const getStaticPaths: GetStaticPaths = async () => {
   const prismic = getPrismicClient();
   const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
    ],{
      fetch: ['posts.uid'],
      pageSize: 10
    }); 

    const paths = posts.results.map((post) => {
      return { params: { slug: post.uid } };
    });

   // TODO
   return {
     paths,
     fallback: true,

   }
};

export const getStaticProps: GetStaticProps = async context => {

  const { slug } = context.params;
  
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const contents =  response.data.content.map((content) => {
    return {
      heading: content.heading,
      body: content.body
    }
  });

  const post = {
    first_publication_date: response.first_publication_date,
    uid: response.uid,
    data: {
      author: response.data.author,
      banner: {
        url: response.data.banner.url
      },
      content: contents,
      title: response.data.title,
      subtitle: response.data.subtitle,
    }
  };
//console.log(post)
  // TODO
  return {
    props: {
      post,
    }
  }
};
