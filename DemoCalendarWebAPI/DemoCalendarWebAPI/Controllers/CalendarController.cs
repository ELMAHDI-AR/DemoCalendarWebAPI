using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace DemoCalendarWebAPI.Controllers
{
    public class CalendarController : ApiController
    {
        /// <summary>
        /// Gets all events from Events table
        /// </summary>
        /// <returns></returns>
        public IHttpActionResult GetEvents()
        {
            using (CalendarDBEntities context = new CalendarDBEntities())
            {
                var eventsList = context.Events.OrderBy(a => a.StartDate).ToList();
                return Ok(eventsList);  
            }
        }

        /// <summary>
        /// Save or update event.
        /// </summary>
        /// <param name="eventObject"></param>
        /// <returns></returns>
        
        public IHttpActionResult PostSaveOrUpdate(Event NewEvent)
        {
            using (CalendarDBEntities context = new CalendarDBEntities())
            {
                if(!ModelState.IsValid)
                {
                    return BadRequest();
                }

                var eventObj = context.Events.FirstOrDefault(e => e.EventID == NewEvent.EventID);
                if(eventObj != null)
                {
                    eventObj.EventTitle = NewEvent.EventTitle;
                    eventObj.EventDescription = NewEvent.EventDescription;
                    eventObj.StartDate = NewEvent.StartDate;
                    eventObj.EndDate = NewEvent.EndDate;
                }
                else
                {
                    context.Events.Add(NewEvent);
                }

                context.SaveChanges();

                return Ok();
            }
        }

        /// <summary>
        /// Delete an event based on the given id.
        /// </summary>
        /// <param name="eventId"></param>
        /// <returns></returns>
        public IHttpActionResult DeleteEvent(int eventId)
        {
            using (CalendarDBEntities context = new CalendarDBEntities())
            {
                Event eventObj = context.Events.FirstOrDefault(e=>e.EventID == eventId);

                if(eventObj == null)
                {
                    return NotFound();
                }

                context.Events.Remove(eventObj);
                context.SaveChanges();

                return Ok(eventObj);
            }
        }



    }
}
