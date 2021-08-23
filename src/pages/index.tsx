import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';

import { FiCalendar, FiUser } from 'react-icons/fi';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { formatDate } from '../services/formatDate';
import Link from 'next/link';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home(props: HomeProps) {
  const [posts, setPosts] = useState(props.postsPagination.results);
  const [nextPage, setNextPage] = useState(props.postsPagination.next_page);

  async function loadMore(url: string){
    const response = await fetch(url);
    const data: PostPagination = await response.json();

    const newPosts = data.results.map((post) => {
      return (
        {
          uid: post.uid,
          first_publication_date: post.first_publication_date,
          data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author,
          }   
        }
      );
    })

    //console.log(newPosts);
    //return;

    setNextPage(data.next_page);
    setPosts(
      [
        ...posts,
        ...newPosts
      ]
    );
  }

  // TODO
  return (
    <main className={commonStyles.content}>
      <div className={styles.posts}>

        {posts.map((post) => {
          return (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <h1>{post.data.title}</h1>
                <h2>{post.data.subtitle}</h2>
                <div className={styles.info}>
                  <time><FiCalendar /> {formatDate(post.first_publication_date)}</time>
                  <span><FiUser /> {post.data.author}</span>
                </div>
              </a>
            </Link>
          );
        })}

      </div>

      { nextPage != null && (
        <footer className={styles.loadMore}>
          <a onClick={() => loadMore(nextPage)}>Carregar mais posts</a>
        </footer>
      )}
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
    ],{
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 1

    });
    
    const posts = postsResponse.results.map((post) => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {        
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        }
      }
    });

    return {
      props: {
        postsPagination: {
          results: posts,
          next_page: postsResponse.next_page
        }
      }

    }

  //TODO
};
