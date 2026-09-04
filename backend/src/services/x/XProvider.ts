export interface Tweet {
  id: string;
  text: string;
  authorId: string;
  username: string;
  displayName: string;
  profileImage?: string;
  replyToTweetId?: string;
}

export interface XUser {
  id: string;
  username: string;
  displayName: string;
  profileImage?: string;
}

export interface XProvider {
  getMentions(sinceId?: string): Promise<Tweet[]>;
  replyToTweet(tweetId: string, text: string): Promise<string>; // returns new tweet ID
  getUser(userId: string): Promise<XUser>;
  authenticate(): Promise<void>;
}
