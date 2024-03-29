import { Component } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-create-thread-form',
  templateUrl: './create-thread-form.component.html',
  styleUrls: ['./create-thread-form.component.css'],
})
export class CreateThreadFormComponent {
  imageFile: File | null = null;
  loggedIn = false;

  // Constructor for the component that takes AngularFirestore, AngularFireAuth,
  // AngularFireStorage and Router as dependencies
  constructor(
    private storage: AngularFireStorage,
    private firestore: AngularFirestore,
    private router: Router,
    private afAuth: AngularFireAuth
  ) {
    // Check if a user is logged in
    this.afAuth.authState.subscribe((user) => {
      this.loggedIn = !!user;
      if (!this.loggedIn) {
        alert('Please log in to create a post.');
        this.router.navigate(['/login']);
      }
    });
  }

  // Sets the imageFile propety to the file selected by the user
  onFileSelected(event: any): void {
    this.imageFile = event.target.files[0];
  }

  // Returns the username of the user with the specificed user id
  // userId is the Id assigned to a users account when created
  async getUsername(userId: string): Promise<string> {
    const userDocSnap = await firstValueFrom(this.firestore.collection('users').doc(userId).get());
    if (userDocSnap.exists) {
      return (userDocSnap.data() as any).username;
    } else {
      return 'Anonymous';
    }
  }

  // When the form is submitted, stores the data entered as a post in the Firestore
  // Routes the user to my-threads page when finished
  async onSubmit(postText: string, event: Event) {
    event.preventDefault();

    // Check if an image file has been selected
    // If not, prompt user to select an image file
    if (!this.imageFile) {
      alert('Please select an image to upload.');
      return;
    }

    // Get the current user
    const user = await this.afAuth.currentUser;
    if (!user) {
      alert('User not found.');
      return;
    }

    // Get the current user's userId and username 
    const userId = user.uid;
    const username = await this.getUsername(userId);

    // Upload the image selected to Firebase Storage and store the post data in Firestore 
    const filePath = `images/${new Date().getTime()}_${this.imageFile.name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, this.imageFile);

    const postId=this.firestore.createId();

    const uploadAndStoreData = async () => {
      return new Promise<void>(async (resolve) => {
        task.snapshotChanges()
          .pipe(
            finalize(() => {
              fileRef.getDownloadURL().subscribe(async (imageUrl: string) => {
                await this.firestore.collection('posts').doc(postId).set({
                  postText: postText,
                  postImg: imageUrl,
                  timestamp: new Date(),
                  userId: userId,
                  username: username,
                  countThumbUp:0,
                  countThumbDown:0,
                  countSmile:0,
                  countStraight:0,
                  countLaugh:0,
                  countQuestion:0,
                  countHeart:0,
                  postId:postId
                });
                await this.router.navigate(['/my-threads']);
                resolve();
              });
            })
          )
          .subscribe();
      });
    };

    await uploadAndStoreData();
  }
}
