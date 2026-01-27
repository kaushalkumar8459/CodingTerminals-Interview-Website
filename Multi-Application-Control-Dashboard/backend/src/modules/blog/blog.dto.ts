export class CreateBlogDto {
  title: string;
  content: string;
  author: string;
  status: string;
}

export class UpdateBlogDto {
  title?: string;
  content?: string;
  author?: string;
  status?: string;
}
