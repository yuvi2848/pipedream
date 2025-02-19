import googleCalendar from "../../google_calendar.app.mjs";

export default {
  key: "google_calendar-event-cancelled",
  name: "Event Cancelled",
  description: "Emits when an event is cancelled or deleted",
  version: "0.1.0",
  type: "source",
  dedupe: "unique", // Dedupe events based on the Google Calendar event ID
  props: {
    googleCalendar,
    calendarId: {
      propDefinition: [
        googleCalendar,
        "calendarId",
      ],
    },
    timer: {
      type: "$.interface.timer",
      default: {
        intervalSeconds: 5 * 60,
      },
    },
  },
  async run(event) {
    const intervalMs = 1000 * (event.interval_seconds || 300); // fall through to default for manual testing
    const now = new Date();

    const updatedMin = new Date(now.getTime() - intervalMs).toISOString();

    const config = {
      calendarId: this.calendarId,
      updatedMin,
      showDeleted: true,
      singleEvents: true,
      orderBy: "startTime",
    };
    const { items: events } = await this.googleCalendar.listEvents(config);

    if (Array.isArray(events)) {
      for (const event of events) {
        // only emit if status is cancelled
        if (event.status === "cancelled") {
          const {
            summary,
            id,
          } = event;
          this.$emit(event, {
            summary,
            id,
            ts: +new Date(event.start.dateTime),
          });
        }
      }
    } else {
      console.log("nothing to emit");
    }
  },
};
