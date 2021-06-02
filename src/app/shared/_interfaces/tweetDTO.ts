import { DetailsUserDTO } from './detailsUserDTO.model';
export interface TweetDTO {
  id: number;
  body: string;
  image: string;
  creationDate: Date;
  likeCount: number;
  ReplyCount: number;
  author: DetailsUserDTO;
}