/**
 * Topics Feature - Barrel Export
 * Exports all public components, types, and utilities
 */

// Components
export { RatingSelector } from "./components/rating-selector"
export { CategorySelector } from "./components/category-selector"
export { TopicBatchForm } from "./components/topic-batch-form"
export { TopicList } from "./components/topic-list"
export { TopicForm } from "./components/topic-form"
export { TopicCard } from "./components/topic-card"

// Types
export type {
  Rating,
  RatingInfo,
  Category,
  TopicFormData,
  TopicBatchInput,
} from "./types/topic.types"

export {
  M_CATEGORIES,
  E_CATEGORIES,
  S_CATEGORIES,
  RATINGS,
  getRatingById,
  getCategoryById,
  generateTopicCode,
} from "./types/topic.types"

// Validation
export {
  topicSchema,
  topicBatchSchema,
  topicUpdateSchema,
} from "./utils/topic.validation"

export type {
  TopicInput,
  TopicBatchInput as TopicBatchInputValidation,
  TopicUpdateInput,
} from "./utils/topic.validation"

// Server Actions
export {
  getAllTopicsServer,
  getTopicById,
  createTopicAction,
  updateTopicAction,
  createTopicBatchAction,
  deleteTopicAction,
} from "./services/topic.server"

// Client API
export { getAllTopicsClient } from "./services/topic.api"
