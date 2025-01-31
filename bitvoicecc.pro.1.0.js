async function processIncomingEvent(a){const l={salutation:"Mr.",stage:"Prospecting",maxResults:1};if(window.Espo&&window.Espo.Ajax){a=a.Data?.phoneNumber;if(a){const r=formatPhoneNumber(a);if(r)try{var t=await Espo.Ajax.getRequest("Opportunity?maxSize=1&where[0][attribute]=phoneNumber&where[0][type]=equals&where[0][value]="+encodePhoneNumberForApi(a));if(0<t.list.length)window.location.hash="#Opportunity/view/"+t.list[0].id;else{var n,i=await Espo.Ajax.getRequest("Contact?maxSize=1&where[0][attribute]=phoneNumber&where[0][type]=equals&where[0][value]="+encodePhoneNumberForApi(a));let e=null,t=null;(t=0<i.list.length&&(e=i.list[0].id,0<(n=await Espo.Ajax.getRequest("Opportunity?maxSize=1&where[0][attribute]=contactId&where[0][type]=equals&where[0][value]="+e)).list.length)?n.list[0].id:t)?window.location.hash="#Opportunity/view/"+t:((i=null)=>{var e=`
            <div class="modal fade" id="enquiryModal" tabindex="-1" role="dialog">
                <div class="modal-dialog modal-lg" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 class="modal-title">
                                <span class="fas fa-plus"></span>
                                Create Enquiry
                            </h4>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <form id="enquiryForm" class="record">
                                <div class="record-grid">
                                    <div class="panel panel-default">
                                        <div class="panel-body">
                                            <!-- Name Section -->
                                            <div class="cell form-group" data-name="name">
                                                <label class="control-label" data-name="name">
                                                    Name
                                                    <span class="required-sign">*</span>
                                                </label>
                                                <div class="field" data-name="name">
                                                    <div class="row">
                                                        <div class="col-sm-2">
                                                            <select class="form-control main-element" name="salutationName">
                                                                <option value="Mr.">Mr.</option>
                                                                <option value="Mrs.">Mrs.</option>
                                                                <option value="Ms.">Ms.</option>
                                                                <option value="Dr.">Dr.</option>
                                                            </select>
                                                        </div>
                                                        <div class="col-sm-5">
                                                            <input type="text" class="form-control main-element" name="firstName" placeholder="First Name" required maxlength="100">
                                                        </div>
                                                        <div class="col-sm-5">
                                                            <input type="text" class="form-control main-element" name="lastName" placeholder="Last Name" required maxlength="100">
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <!-- Phone -->
                                            <div class="cell form-group" data-name="phone">
                                                <label class="control-label" data-name="phone">Phone</label>
                                                <div class="field" data-name="phone">
                                                    <input type="tel" class="form-control main-element" name="phoneNumber" value="${r}" readonly>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="saveEnquiry">Save</button>
                        </div>
                    </div>
                </div>
            </div>`;const o=$(e).appendTo("body");o.modal("show"),$("#saveEnquiry").on("click",async function(){var e=document.getElementById("enquiryForm");if(e.checkValidity()){var t=new FormData(e),t={stage:l.stage,salutationName:t.get("salutationName")||l.salutation,...Object.fromEntries(t),name:t.get("firstName")+" "+t.get("lastName")},a=(i?.id&&(t.contactId=i.id),$(this));a.prop("disabled",!0).html('<span class="spinner-border spinner-border-sm"></span> Saving...');try{var n=await Espo.Ajax.postRequest("Opportunity",t);o.modal("hide"),window.location.hash="#Opportunity/view/"+n.id}catch(e){console.error("Error creating opportunity:",e),Espo.Ui.error("Error creating opportunity. Please try again.")}finally{a.prop("disabled",!1).text("Save")}}else e.reportValidity()}),o.on("hidden.bs.modal",function(){o.remove()}),i&&Object.entries(i).forEach(([e,t])=>{e=o.find(`[name="${e}"]`);e.length&&e.val(t)})})(e)}}catch(e){console.error("BitvoiceCC Error:",e);t=new URLSearchParams({phoneNumber:a,contactId:contactId||""});window.location.hash="#Opportunity/create?"+t.toString()}else console.error("BitvoiceCC: Invalid phone number")}else console.error("BitvoiceCC: Missing required phoneNumber")}else console.error("BitvoiceCC: Espo not initialized")}function formatPhoneNumber(e){return e?(e=e.replace(/\D/g,"")).length<10?(console.error("BitvoiceCC: Invalid phone number length"),null):e.startsWith("00")?"+"+e.slice(2):10===e.length||11===e.length&&e.startsWith("0")?"+91"+(e.startsWith("0")?e.slice(1):e):10<e.length?e.startsWith("+")?e:"+"+e:null:(console.error("BitvoiceCC: Missing required phoneNumber"),null)}function encodePhoneNumberForApi(e){e=formatPhoneNumber(e);if(e)return encodeURIComponent(e);throw new Error("Invalid phone number format")}window.BitvoiceCCF={activeCalls:new Map,EVENT_TYPES:{INBOUND_CALL:"INBOUND_CALL",OUTBOUND_CALL:"OUTBOUND_CALL",HANGUP:"HANGUP",AGENT_LOGIN:"AGENT_LOGIN",MISSEDCALL:"MISSEDCALL"},async handleEvent(e){var t=e.Event;if(Object.values(this.EVENT_TYPES).includes(t))try{switch(t){case this.EVENT_TYPES.INBOUND_CALL:await this.handleInboundCall(e);break;case this.EVENT_TYPES.OUTBOUND_CALL:await this.handleOutboundCall(e);break;case this.EVENT_TYPES.HANGUP:await this.handleHangup(e);break;case this.EVENT_TYPES.AGENT_LOGIN:await this.handleAgentLogin(e);break;case this.EVENT_TYPES.MISSEDCALL:await this.handleMissedCall(e)}}catch(e){console.error("Error handling event:",e)}else console.log("Unhandled event type: "+t)},async handleOutboundCall(e){var t=e.Data,a=t.uniqueid;this.activeCalls.set(a,{startTime:new Date,data:t}),await processIncomingEvent(e)},async handleInboundCall(e){var t=e.Data,a=t.uniqueid;this.activeCalls.set(a,{startTime:new Date,data:t}),await processIncomingEvent(e)},async handleHangup(e){console.log("Hangup event:",e.Data),console.log("Active calls:",this.activeCalls);var e=e.Data,t=e.uniqueid;if(this.activeCalls.has(t)){var a=this.activeCalls.get(t),a=new Date-a.startTime;e.duration=a;try{await this.createCallEntity(e)}catch(e){console.error("Error in handleHangup while creating call entity:",e)}this.activeCalls.delete(t)}},async handleAgentLogin(e){},async handleMissedCall(e){},async getParentEntity(){var e=window.location.hash.match(/#([^/]+)\/view\/([^/]+)/);return e?{entityType:e[1],entityId:e[2]}:null},async createCallEntity(e){if(!window.Espo||!window.Espo.Ajax)throw new Error("BitvoiceCC: Espo not initialized");let t=null;try{var a=await window.Espo.Ajax.getRequest("App/user");t=a.user}catch(e){console.warn("Could not fetch current user data:",e)}var a=await this.getParentEntity(),n=new Date(e.eventtime),i=new Date(n.getTime()+e.duration),o=e=>e.getFullYear()+"-"+String(e.getMonth()+1).padStart(2,"0")+"-"+String(e.getDate()).padStart(2,"0")+" "+String(e.getHours()).padStart(2,"0")+":"+String(e.getMinutes()).padStart(2,"0")+":"+String(e.getSeconds()).padStart(2,"0"),n={name:"Call with "+(e.cid_name||e.cid_num),status:"Held",direction:"INBOUND_CALL"===e.calldirection?"Inbound":"Outbound",dateStart:o(n),dateEnd:o(i),duration:Math.round(e.duration/1e3),description:`Call ${e.calldirection}
From: ${e.from}
To: ${e.to}
Agent: `+e.agent,phoneNumber:e.from,callId:e.uniqueid};a&&(n.parentType=a.entityType,n.parentId=a.entityId),t&&(n.assignedUserId=t.id,t.teamsIds&&0<t.teamsIds.length&&(n.teamsIds=t.teamsIds),t.defaultTeamId)&&(n.defaultTeamId=t.defaultTeamId);try{var l=await window.Espo.Ajax.getRequest("Contact?maxSize=1&where[0][attribute]=phoneNumber&where[0][type]=equals&where[0][value]="+encodePhoneNumberForApi(e.from)),r=(0<l.list.length&&(n.contactId=l.list[0].id,n.contactName=l.list[0].name),await window.Espo.Ajax.postRequest("Call",n));return console.log("Call entity created:",r),r}catch(e){throw console.error("Error creating call entity:",e),e}}},window.BitvoiceCC=function(e){window.BitvoiceCCF.handleEvent(e)},window.BitvoiceCCAPI=window.BitvoiceCC;
