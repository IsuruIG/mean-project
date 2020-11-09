import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  // posts = [
  //   {title: 'First Post', content: 'This is the first post content'},
  //   {title: 'Second Post', content: 'This is the second post content'},
  //   {title: 'Third Post', content: 'This is the third post content'}
  // ];
  posts: Post[] = [];
  isLoading: boolean = false;
  totalPosts = 0;
  postsPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  userIsAuthenticated = false;
  userId: string;

  private postsSub: Subscription;
  private authSub: Subscription;

  constructor(public postsService: PostsService, private authService: AuthService) {}

  ngOnInit() {
    this.isLoading = true;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.postsSub = this.postsService.getPostUpdateListener()
      .subscribe((postsData: {posts: Post[], postCount: number}) => {
        this.isLoading = false;
        this.totalPosts = postsData.postCount;
        this.posts = postsData.posts;
      });
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authSub = this.authService.getAuthStatusListener()
     .subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
      this.userId = this.authService.getUserId();
     });
  }

  onPageChange(page: PageEvent) {
    this.isLoading = true;
    this.currentPage = page.pageIndex + 1;
    this.postsPerPage = page.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  onDelete(id: string) {
    this.isLoading = true;
    this.postsService.deletePost(id).subscribe(() => {
      this.postsService.getPosts(this.postsPerPage, this.currentPage);
    });
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authSub.unsubscribe();
  }
}
