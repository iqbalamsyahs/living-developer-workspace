import {defineField, defineType} from 'sanity'
import {DesktopIcon} from '@sanity/icons/Desktop'

export const deskObject = defineType({
  name: 'deskObject',
  title: 'Desk Object',
  type: 'document',
  icon: DesktopIcon,
  fields: [
    defineField({
      name: 'internalName',
      title: 'Internal Name',
      description: 'Human-readable label, e.g. "Main Monitor" or "Japanese Notebook".',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'modelType',
      title: 'Model Type',
      description:
        'Must map exactly to a frontend component name (monitor, whiteboard, notebook).',
      type: 'string',
      options: {
        list: [
          {title: 'Monitor', value: 'monitor'},
          {title: 'Whiteboard', value: 'whiteboard'},
          {title: 'Notebook', value: 'notebook'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'contentReference',
      title: 'Content Reference',
      description: 'The case study or journal entry opened when this object is clicked.',
      type: 'reference',
      to: [{type: 'projectCaseStudy'}, {type: 'journalEntry'}],
    }),
  ],
  preview: {
    select: {title: 'internalName', subtitle: 'modelType'},
  },
})
