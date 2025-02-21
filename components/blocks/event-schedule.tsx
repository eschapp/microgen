import { useRef, useEffect } from 'react'
import dayjs from 'dayjs'
import ScrollContainer from 'react-indiana-drag-scroll'
import { dayOffset, readableHash } from '../../helpers/utilities';
import { Section } from "../section";
import { AddCard } from './event-schedule/event'
import ScheduleTable from './event-schedule/schedule-table';
import { IconClickDrag } from './event-schedule/icons';
import { backgroundSchema } from "../../schema/background"
import { navigationLabelSchema } from "../../schema/navigation-label";

function annotateEvents(data, events) {
  const startDate = dayjs(data.scheduleStartDate)
  const endDate = dayjs(data.scheduleEndDate)
  const numDays = Number(dayOffset(startDate, endDate) + 1)
  const eventWithinRange = (e) => (e.startDay >= 0 && e.startDay < numDays)
  const uniqEventHashes = new Set()

  return Object.keys(events).map((fileName) => {
    const event = {
      ...events[fileName],
      fileName,
    }
    event.startDay = dayOffset(startDate, event.date)
    event.isWithinRange = eventWithinRange(event)
    event.hash = `#${event.name}`

    // To ensure our event modal hashes are unique we keep a Set of all the hashes
    if (uniqEventHashes.has(event.hash)) {
      // Filename's are always unique
      event.hash = `#${readableHash(event.fileName)}`
    }

    uniqEventHashes.add(event.hash)

    return event
  })
}

export const EventSchedule = ({ data, events, parentField = "" }) => {
  const scrollContainer = useRef(null);

  useEffect(() => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollTo(0, 0);
    }
  });

  return (
    <Section
      background={data.background}
      navigationLabel={data.navigationLabel}
    >
      {events.length < 1 &&
        <div className="max-w-desktop-full mx-auto p-10">
          <p>No events to display on schedule.</p>
        </div>
      }
      {events.length >= 1 &&
        <>
          <div className="bg-gray-100 py-10 pb-0 text-center">
            <IconClickDrag />
            Click and drag the schedule to navigate
          </div>
          <div className='w-full max-w-desktop-full mx-auto min-h-[10vh]' id='schedule'>
            <ScrollContainer innerRef={scrollContainer} className="scroll-container bg-gray-100 py-10" ignoreElements='.modal'>
              <div className="flex-none min-h-full w-full">
                <div className="content">
                  <ScheduleTable events={annotateEvents(data, events)} data={data} />
                </div>
              </div>
            </ScrollContainer>
            {data.addEventLink && (
              <div className={`bg-gray-100 p-10 pt-0`}>
                <AddCard addEventlink={data.addEventLink} />
              </div>
            )}
          </div>
        </>
      }
    </Section>
  );
};

export const eventScheduleBlockSchema: any = {
  label: "Event Schedule",
  name: "eventSchedule",
  ui: {
    defaultItem: {
      scheduleStartDate: new Date().toISOString(),
      scheduleEndDate: new Date().toISOString(),
    }
  },
  fields: [
    backgroundSchema,
    navigationLabelSchema,
    {
      label: "Schedule Start Date",
      name: "scheduleStartDate",
      description: "The first day of the schedule",
      type: "datetime",
      required: true,
    },
    {
      label: "Schedule End Date",
      name: "scheduleEndDate",
      description: "The last day of the schedule",
      type: "datetime",
      required: true,
    },
    {
      label: "Add Event Link",
      name: "addEventLink",
      description: "A link to a form or repo to add an event to the schedule",
      type: "string",
    },
  ],
};
