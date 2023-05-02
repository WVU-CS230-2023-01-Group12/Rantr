
import { Component, Input } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';


@Component({
  selector: 'app-thread-display-card',
  templateUrl: './thread-display-card.component.html',
  styleUrls: ['./thread-display-card.component.css']
})
export class ThreadDisplayCardComponent {
  @Input() post: any;

  constructor(private firestore: AngularFirestore,private afAuth: AngularFireAuth) {}

  private isCountedThumbUp: boolean=false;
  private isCountedThumbDown: boolean=false;
  private isCountedSmile: boolean=false;
  private isCountedStraight: boolean=false;
  private isCountedLaugh: boolean=false;
  private isCountedQuestion: boolean=false;
  private isCountedHeart: boolean=false;

  public updateCountThumbUp() {
    this.post.countThumbUp += this.isCountedThumbUp? -1: 1;
    this.isCountedThumbUp = !this.isCountedThumbUp;
  }
  public updateCountThumbDown() {
    this.post.countThumbDown += this.isCountedThumbDown? -1: 1;
    this.isCountedThumbDown = !this.isCountedThumbDown;
  }
  public updateCountSmile() {
    this.post.countSmile += this.isCountedSmile? -1: 1;
    this.isCountedSmile = !this.isCountedSmile;
  }
  public updateCountStraight() {
    this.post.countStraight += this.isCountedStraight? -1: 1;
    this.isCountedStraight = !this.isCountedStraight;
  }
  public updateCountLaugh() {
    this.post.countLaugh += this.isCountedLaugh? -1: 1;
    this.isCountedLaugh = !this.isCountedLaugh;
  }
  public updateCountQuestion() {
    this.post.countQuestion += this.isCountedQuestion? -1: 1;
    this.isCountedQuestion = !this.isCountedQuestion;
  }
  public updateCountHeart() {
    this.post.countHeart += this.isCountedHeart? -1: 1;
    this.isCountedHeart = !this.isCountedHeart;
  }

  public async deletePost(id:string){
    const user = await this.afAuth.currentUser;
    if (!user) {
      alert('User not found.');
      return;
    }
    const userId = user.uid;
    if(userId==this.post.userId) {
      this.firestore.collection('posts').doc(id).delete();
    }
    else{
      alert('You do not have the authorization to remove this post.');
    }
  }
}