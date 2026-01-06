import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StudyNote, StudyNoteDocument } from './schemas/study-note.schema';

@Injectable()
export class StudyNotesService {
  constructor(@InjectModel(StudyNote.name) private studyNoteModel: Model<StudyNoteDocument>) {}

  /**
   * Get all study notes with pagination
   */
  async getAllNotes(page: number = 1, limit: number = 10, userId?: string) {
    const skip = (page - 1) * limit;
    const query = userId ? { createdBy: new Types.ObjectId(userId) } : {};

    const [notes, total] = await Promise.all([
      this.studyNoteModel
        .find(query)
        .populate('createdBy', 'username email')
        .populate('lastModifiedBy', 'username email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.studyNoteModel.countDocuments(query),
    ]);

    return {
      notes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get study note by ID
   */
  async getNoteById(noteId: string) {
    const note = await this.studyNoteModel
      .findById(noteId)
      .populate('createdBy', 'username email')
      .populate('lastModifiedBy', 'username email');

    if (!note) {
      throw new NotFoundException('Study note not found');
    }

    // Increment views
    note.views += 1;
    await note.save();

    return note;
  }

  /**
   * Create new study note
   */
  async createNote(createData: any, userId: string) {
    const note = await this.studyNoteModel.create({
      ...createData,
      createdBy: new Types.ObjectId(userId),
    });

    return note.populate('createdBy', 'username email');
  }

  /**
   * Update study note
   */
  async updateNote(noteId: string, updateData: any, userId: string) {
    const note = await this.studyNoteModel.findByIdAndUpdate(
      noteId,
      {
        ...updateData,
        lastModifiedBy: new Types.ObjectId(userId),
      },
      { new: true },
    );

    if (!note) {
      throw new NotFoundException('Study note not found');
    }

    return note;
  }

  /**
   * Delete study note
   */
  async deleteNote(noteId: string) {
    const result = await this.studyNoteModel.findByIdAndDelete(noteId);

    if (!result) {
      throw new NotFoundException('Study note not found');
    }

    return { message: 'Study note deleted successfully' };
  }

  /**
   * Search study notes
   */
  async searchNotes(query: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [notes, total] = await Promise.all([
      this.studyNoteModel
        .find({
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { content: { $regex: query, $options: 'i' } },
            { tags: { $regex: query, $options: 'i' } },
          ],
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.studyNoteModel.countDocuments({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } },
        ],
      }),
    ]);

    return {
      notes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get featured notes
   */
  async getFeaturedNotes(limit: number = 5) {
    return await this.studyNoteModel
      .find({ isFeatured: true, isPublished: true })
      .populate('createdBy', 'username email')
      .limit(limit)
      .sort({ views: -1 });
  }

  /**
   * Get notes by category
   */
  async getNotesByCategory(category: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [notes, total] = await Promise.all([
      this.studyNoteModel
        .find({ category, isPublished: true })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.studyNoteModel.countDocuments({ category, isPublished: true }),
    ]);

    return {
      notes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async create(title: string, content: string, category: string, createdBy: string, visibility?: string) {
    const note = new this.studyNoteModel({ title, content, category, createdBy, visibility: visibility || 'private' });
    return note.save();
  }

  async findAll(visibility?: string) {
    const query = visibility ? { visibility, isDeleted: false } : { isDeleted: false };
    return this.studyNoteModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string) {
    const note = await this.studyNoteModel.findById(id).exec();
    if (note) await this.studyNoteModel.updateOne({ _id: id }, { $inc: { views: 1 } });
    return note;
  }

  async getByUser(userId: string) {
    return this.studyNoteModel.find({ createdBy: userId, isDeleted: false }).sort({ createdAt: -1 }).exec();
  }

  async update(id: string, updateData: any) {
    return this.studyNoteModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async delete(id: string) {
    return this.studyNoteModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).exec();
  }

  async getByCategory(category: string) {
    return this.studyNoteModel.find({ category, visibility: 'public', isDeleted: false }).exec();
  }

  async search(query: string) {
    return this.studyNoteModel.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ],
      isDeleted: false
    }).exec();
  }

  async getStats() {
    const total = await this.studyNoteModel.countDocuments({ isDeleted: false });
    const public_notes = await this.studyNoteModel.countDocuments({ visibility: 'public', isDeleted: false });
    const private_notes = await this.studyNoteModel.countDocuments({ visibility: 'private', isDeleted: false });
    const totalViews = await this.studyNoteModel.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);
    return { total, public: public_notes, private: private_notes, totalViews: totalViews[0]?.total || 0 };
  }
}
