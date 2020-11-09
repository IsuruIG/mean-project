import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({providedIn: 'root'})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], postCount: number}>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`;
    this.http.get<{message: string, posts: any, maxPosts: number}>(
      "http://localhost:3000/posts" + queryParams
    )
    .pipe(map((postData) => {
      return {
        posts: postData.posts.map(post => {
          return {
            title: post.title,
            content: post.content,
            id: post._id,
            imagePath: post.imagePath,
            creator: post.creator
          };
        }),
        maxPosts: postData.maxPosts
      };
    })
    )
    .subscribe((servePostData) => {
      console.log(servePostData);
      this.posts = servePostData.posts;
      this.postsUpdated.next(
        {
          posts: [...this.posts],
          postCount: servePostData.maxPosts
        });
    });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost (id: string) {
    // return{...this.posts.find(p => p.id == id)};
    return this.http.get<{_id: string, title: string, content:string, imagePath: string, creator: string }>("http://localhost:3000/posts/" + id);
  }

  addPost(title: string, content: string, image: File) {
    const postMethodData = new FormData();
    postMethodData.append("title", title);
    postMethodData.append("content", content);
    postMethodData.append("image", image, title);

    this.http.post<{messge: string; post: Post}>('http://localhost:3000/posts', postMethodData)
    .subscribe(() => {
      this.router.navigate(["/"]);
    });
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof(image) === 'object') {
      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("imagePath", image, title);
    }
    else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator: null
      };
    }
    this.http.put("http://localhost:3000/posts/" + id, postData)
    .subscribe(() => {
      this.router.navigate(["/"]);
    });
  }

  deletePost(postId: string) {
    return this.http.delete("http://localhost:3000/posts/" + postId);
  }
 }
