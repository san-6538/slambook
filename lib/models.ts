import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IQuestion {
  question: string;
  tags: string[];
}

export interface IAnswer {
  question: string;
  answer: string;
}

export interface ISlambookTemplate extends Document {
  ownerEmail: string;
  creatorName: string;
  questions: IQuestion[];
  createdAt: Date;
}

export interface ISlambookEntry extends Document {
  templateId: mongoose.Types.ObjectId;
  ownerEmail: string;
  creatorName: string;
  friendName: string;
  yearsKnown: number;
  interactionFrequency: string;
  bondType: string;
  interests: string[];
  personalityTraits: string[];
  relationshipTitle: string;
  answers: IAnswer[];
  // NOTE: photos are intentionally NOT stored here. They stay on the filler's
  // device and are embedded only into the self-contained file they download.
  summary: {
    text: string;
    keywords: string[];
  };
  theme: string;
  createdAt: Date;
}

const SlambookTemplateSchema = new Schema<ISlambookTemplate>({
  ownerEmail: { type: String, required: true, index: true },
  creatorName: { type: String, required: true },
  questions: [
    {
      question: { type: String },
      tags: [{ type: String }],
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const SlambookEntrySchema = new Schema<ISlambookEntry>({
  templateId: { type: Schema.Types.ObjectId, ref: 'SlambookTemplate', required: true },
  ownerEmail: { type: String, required: true, index: true },
  creatorName: { type: String, required: true },
  friendName: { type: String, required: true },
  yearsKnown: { type: Number, required: true },
  interactionFrequency: { type: String, required: true },
  bondType: { type: String, required: true },
  interests: [{ type: String }],
  personalityTraits: [{ type: String }],
  relationshipTitle: { type: String },
  answers: [
    {
      question: { type: String },
      answer: { type: String },
    },
  ],
  summary: {
    text: { type: String },
    keywords: [{ type: String }],
  },
  theme: { type: String, default: 'scrapbook' },
  createdAt: { type: Date, default: Date.now },
});

export const SlambookTemplate = models.SlambookTemplate || model<ISlambookTemplate>('SlambookTemplate', SlambookTemplateSchema);
export const SlambookEntry = models.SlambookEntry || model<ISlambookEntry>('SlambookEntry', SlambookEntrySchema);
