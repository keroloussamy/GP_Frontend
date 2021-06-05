import { TweetDTO } from './../shared/_interfaces/tweetDTO';
import { Component, OnInit } from '@angular/core';
import { TweetService } from '../shared/services/tweet.service';
import { Router } from '@angular/router';
import { ImageDTO } from '../shared/_interfaces/imageDTO';
import { VideoDTO } from '../shared/_interfaces/videoDTO';
import { AddTweetDTO } from '../shared/_interfaces/addTweetDTO';
import { ElementHelper } from 'protractor';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  homePageTweets: TweetDTO[];

  constructor(private _tweetService: TweetService, private _router: Router) {}

  search(event) {
    this._router.navigate(['/search'], {
      queryParams: { key: event.target.value },
    });
  }
  modal: HTMLElement;
  modalWrapper: HTMLElement;
  modalInput: HTMLInputElement;

  ngOnInit(): void {
    this._tweetService.getHomePageTweets().subscribe((res) => {
      this.homePageTweets = res;
      console.log(res);
    });
    this.modal = document.querySelector('.modal');
    this.modalWrapper = document.querySelector('.modal-wrapper');
    this.modalInput = document.querySelector('.modal-input');
    this.sidebar = document.querySelector('.sidebar');
    this.sidebarWrapper = document.querySelector('.sidebar-wrapper');

    this.darkElements1 = document.querySelectorAll('.dark-mode-1');
    this.darkElements2 = document.querySelectorAll('.dark-mode-2');
    this.lighTexts = document.querySelectorAll('.light-text');
    this.borders = document.querySelectorAll('.border');
    this.circle = document.querySelector('.circle');
  }

  openPostTweetWindow() {
    this.modal.style.display = 'block';
    this.modalWrapper.classList.add('modal-wrapper-display');
  }

  closePostTweetWindow() {
    this.modal.style.display = 'none';
    this.modalWrapper.classList.remove('modal-wrapper-display');

    if (this.modalInput.value !== '') {
      this.modalInput.value = '';
    }

    console.log(this.videoUrls);
    this.imageUrls = [];
    this.videoUrls = '';
    this.imageFiles = [];
    this.videoFile = null;
    var videoList = document.querySelector('.video-list');
    if (videoList.firstChild != null) {
      videoList.firstChild.remove();
    }
  }

  imageUrls = new Array<string>();
  imageFiles: File[] = [];
  detectImageFiles(event) {
    this.imageUrls = [];
    let files = event.target.files;
    if (files) {
      if (files.length > 4 || this.videoUrls != '') {
        alert('you are allowed with only one gif or 4 images');
        return;
      }
      for (let file of files) {
        let reader = new FileReader();
        reader.onload = (e: any) => {
          this.imageUrls.push(e.target.result);
        };
        this.imageFiles.push(file);
        reader.readAsDataURL(file);
      }
    }
  }

  videoUrls = new String();
  videoFile: File = null;
  detectVideoFiles(event) {
    this.videoUrls = '';
    let files = event.target.files;
    if (files) {
      if (files.length > 1 || this.imageUrls.length != 0) {
        alert('you are allowed with only one gif or 4 images');
        return;
      }
      for (let file of files) {
        let reader = new FileReader();
        reader.onload = (e: any) => {
          this.videoUrls = e.target.result;

          var videoDiv = document.createElement('div');
          videoDiv.setAttribute('class', 'modal-image position-relative');

          var video = document.createElement('video');
          video.setAttribute('style', 'width: 400px; height: 200px;');
          var videoSource = document.createElement('source');
          var container = document.querySelector('.video-list');

          container.appendChild(videoDiv);
          videoDiv.appendChild(video);
          videoSource.setAttribute('src', e.target.result);
          video.appendChild(videoSource);
          video.load();

          var button = document.createElement('button');
          button.setAttribute('class', 'position-absolute');
          button.setAttribute(
            'style',
            'left: 5%; margin-top: 5px; border: none; background: none; border-radius: 50%;'
          );
          button.addEventListener('click', this.deletVideoFromTweet);
          videoDiv.appendChild(button);

          var i = document.createElement('i');
          i.setAttribute(
            'class',
            'fas fa-times-circle fa-2x text-dark bg-light'
          );
          i.setAttribute('style', 'border-radius: 50%');
          button.appendChild(i);
        };
        this.videoFile = file;
        reader.readAsDataURL(file);
      }
    }
  }

  deletImageFromTweet(event) {
    this.imageUrls.splice(
      this.imageUrls.indexOf(
        event.target.parentElement.previousSibling.getAttribute('src')
      )
    );
    this.imageFiles.splice(
      event.target.parentElement.previousSibling.getAttribute('data-index')
    );
  }

  deletVideoFromTweet() {
    this.videoUrls = '';
    this.videoFile = null;
    var videoList = document.querySelector('.video-list');
    videoList.firstChild.remove();
  }

  imagesNames: ImageDTO[] = [];
  videoName: VideoDTO;
  postTweet() {
    var postText: HTMLTextAreaElement = document.querySelector('.tweet-text');
    if (
      postText.value == '' &&
      this.videoUrls == '' &&
      this.imageUrls.length == 0
    ) {
      console.log(postText.value);
      return;
    }

    for (var i = 0; i < this.imageFiles.length; i++) {
      var result = this.uploadImage(this.imageFiles[i]);
      if (result == 'error') {
        return;
      }
      var image: ImageDTO = {
        imageName: this.imageFiles[i].name,
      };
      this.imagesNames.push(image);
    }

    if (this.videoFile != null) {
      var videoresult = this.uploadVideo(this.videoFile);
      if (videoresult == 'error') {
        return;
      }
      this.videoName = {
        videoName: this.videoFile.name,
      };
    }

    var tweet: AddTweetDTO = {
      body: postText.value,
      images: this.imagesNames,
      video: this.videoName,
    };

    console.log(tweet);

    this._tweetService.addTweet(tweet).subscribe(
      (data) => {
        console.log(data);
      },
      (error) => {
        console.log(error);
      }
    );
    this.closePostTweetWindow();
  }

  uploadImage(image: File): string {
    if (image == null) return;
    var imageName = '';
    console.log(image.name);
    const formDate = new FormData();
    formDate.append('file', image, image.name);
    this._tweetService.uploadTweetImage(formDate).subscribe(
      (data) => {
        return data.fileName;
      },
      (error) => {
        console.log(error);
        alert('error');
        imageName = 'error';
      }
    );
    console.log(imageName);
    return imageName;
  }

  uploadVideo(video: File): string {
    if (video == null) return;
    console.log(video.name);
    const formDate = new FormData();
    formDate.append('file', video, video.name);
    this._tweetService.uploadTweetVideo(formDate).subscribe(
      (data) => {
        return data.fileName;
      },
      (error) => {
        console.log(error);
        alert('error');
        return 'error';
      }
    );
    return '';
  }

  // Sidebar

  sidebar: Element;
  sidebarWrapper: Element;

  Display() {
    this.sidebar.classList.add('sidebar-display');
    this.sidebarWrapper.classList.add('sidebar-wrapper-display');
  }

  Dismiss() {
    this.sidebar.classList.remove('sidebar-display');
    this.sidebarWrapper.classList.remove('sidebar-wrapper-display');
  }

  // dark mode

  darkElements1: NodeListOf<Element>;
  darkElements2: NodeListOf<Element>;
  lighTexts: NodeListOf<Element>;
  borders: NodeListOf<Element>;
  circle:Element;

  supportDarkMode() {
    this.circle.classList.toggle('move');
    Array.from(this.darkElements1).map((darkEl1) =>
      darkEl1.classList.toggle('dark-1')
    );
    Array.from(this.darkElements2).map((darkEl2) =>
      darkEl2.classList.toggle('dark-2')
    );
    Array.from(this.lighTexts).map((lighText) =>
      lighText.classList.toggle('light')
    );
    Array.from(this.borders).map((border) =>
      border.classList.toggle('border-color')
    );
  }
}
