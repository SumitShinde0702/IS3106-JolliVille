import { Schema, model, models } from 'mongoose'

export interface IUser {
  email: string
  name: string
  password: string
  points: number
  avatar: {
    character: string
    items: string[]
    room: {
      furniture: string[]
      wallColor: string
      floorType: string
    }
  }
  journalEntries: Array<{
    date: Date
    content: string
    mood: string
    sentiment: number
  }>
  achievements: Array<{
    id: string
    name: string
    description: string
    dateEarned: Date
  }>
  dailyStreak: number
  lastLoginDate: Date
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  points: { type: Number, default: 0 },
  avatar: {
    character: { type: String, default: 'default' },
    items: [{ type: String }],
    room: {
      furniture: [{ type: String }],
      wallColor: { type: String, default: '#FFFFFF' },
      floorType: { type: String, default: 'wooden' }
    }
  },
  journalEntries: [{
    date: { type: Date, default: Date.now },
    content: { type: String, required: true },
    mood: { type: String, required: true },
    sentiment: { type: Number }
  }],
  achievements: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    dateEarned: { type: Date, default: Date.now }
  }],
  dailyStreak: { type: Number, default: 0 },
  lastLoginDate: { type: Date, default: Date.now }
})

export const User = models.User || model<IUser>('User', userSchema) 