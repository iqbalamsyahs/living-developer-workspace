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
        'Must map exactly to a frontend component name (monitor, whiteboard, notebook, pc, phone).',
      type: 'string',
      options: {
        list: [
          {title: 'Monitor', value: 'monitor'},
          {title: 'Whiteboard', value: 'whiteboard'},
          {title: 'Notebook', value: 'notebook'},
          {title: 'PC', value: 'pc'},
          {title: 'Phone', value: 'phone'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'contentReference',
      title: 'Content Reference',
      description: 'The profile, project, or journal entry opened when this object is clicked.',
      type: 'reference',
      to: [{type: 'project'}, {type: 'journalEntry'}, {type: 'profile'}],
    }),
  ],
  preview: {
    select: {title: 'internalName', subtitle: 'modelType'},
  },
})
