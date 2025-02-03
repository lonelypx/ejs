async function processIncomingEvent(a){if(window.Espo&&window.Espo.Ajax){a=a.Data?.phoneNumber;if(a){const s=formatPhoneNumber(a);if(s){const r=(e=null)=>{var t=`
            <div class="modal fade" id="leadModal" tabindex="-1" role="dialog">
                <div class="modal-dialog modal-lg" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 class="modal-title">
                                <span class="fas fa-user-plus"></span>
                                Create Lead
                            </h4>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <form id="leadForm" class="record">
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
                                                    <input type="tel" class="form-control main-element" name="phoneNumber" value="${s}" readonly>
                                                </div>
                                            </div>

                                            <!-- Email -->
                                            <div class="cell form-group" data-name="email">
                                                <label class="control-label" data-name="email">Email</label>
                                                <div class="field" data-name="email">
                                                    <input type="email" class="form-control main-element" name="emailAddress" placeholder="Email Address">
                                                </div>
                                            </div>

                                            <!-- Status -->
                                            <div class="cell form-group" data-name="status">
                                                <label class="control-label" data-name="status">
                                                    Status
                                                    <span class="required-sign">*</span>
                                                </label>
                                                <div class="field" data-name="status">
                                                    <select class="form-control main-element" name="status" required>
                                                        <option value="New">New</option>
                                                        <option value="Assigned">Assigned</option>
                                                        <option value="In Process">In Process</option>
                                                        <option value="Converted">Converted</option>
                                                        <option value="Recycled">Recycled</option>
                                                        <option value="Dead">Dead</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <!-- Source -->
                                            <div class="cell form-group" data-name="source">
                                                <label class="control-label" data-name="source">Source</label>
                                                <div class="field" data-name="source">
                                                    <select class="form-control main-element" name="source">
                                                        <option value="Phone">Phone</option>
                        
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="saveLead">Save</button>
                        </div>
                    </div>
                </div>
            </div>`;const n=$(t).appendTo("body");n.modal("show"),$("#saveLead").on("click",async function(){var e=document.getElementById("leadForm");if(e.checkValidity()){var t=new FormData(e),t={status:t.get("status")||"New",source:t.get("source")||"Phone",salutationName:t.get("salutationName")||"Mr.",...Object.fromEntries(t),name:t.get("firstName")+" "+t.get("lastName")},a=$(this);a.prop("disabled",!0).html('<span class="spinner-border spinner-border-sm"></span> Saving...');try{var o=await Espo.Ajax.postRequest("Lead",t);n.modal("hide"),window.location.hash="#Lead/view/"+o.id}catch(e){console.error("Error creating lead:",e),Espo.Ui.error("Error creating lead. Please try again.")}finally{a.prop("disabled",!1).text("Save")}}else e.reportValidity()}),n.on("hidden.bs.modal",function(){n.remove()}),e&&Object.entries(e).forEach(([e,t])=>{e=n.find(`[name="${e}"]`);e.length&&e.val(t)})};try{var o,n=await Espo.Ajax.getRequest("Lead?maxSize=1&where[0][attribute]=phoneNumber&where[0][type]=equals&where[0][value]="+encodePhoneNumberForApi(a)),i=await Espo.Ajax.getRequest("Opportunity?maxSize=1&where[0][attribute]=phoneNumber&where[0][type]=equals&where[0][value]="+encodePhoneNumberForApi(a)),l=await Espo.Ajax.getRequest("Contact?maxSize=1&where[0][attribute]=phoneNumber&where[0][type]=equals&where[0][value]="+encodePhoneNumberForApi(a));let e=null,t=null;(t=0<l.list.length&&(e=l.list[0].id,0<(o=await Espo.Ajax.getRequest("Opportunity?maxSize=1&where[0][attribute]=contactId&where[0][type]=equals&where[0][value]="+e)).list.length)?o.list[0].id:t)?window.location.hash="#Opportunity/view/"+t:0<n.list.length&&0<i.list.length?((e,t)=>{t=`
            <div class="modal fade" id="multipleMatchesModal" tabindex="-1" role="dialog">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 class="modal-title">
                                <span class="fas fa-search"></span>
                                Multiple Matches Found
                            </h4>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <!-- Phone Number Display Section -->
                            <div class="form-group">
                                <label class="control-label">Phone Number</label>
                                <div class="input-group">
                                    <input type="text" class="form-control" value="${t}" readonly>
                                    <div class="input-group-append">
                                        <button class="btn btn-outline-secondary copy-phone" type="button" 
                                                data-toggle="tooltip" title="Copy to clipboard">
                                            <span class="fas fa-copy"></span>
                                        </button>
                                    </div>
                                </div>
                            </div>
    
                            <p class="mt-3">We found multiple records matching this phone number. Please select where you'd like to go:</p>
                            <div class="list-group">
                                ${e.lead?`
                                    <a href="#Lead/view/${e.lead.id}" class="list-group-item list-group-item-action">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h5 class="mb-1">Lead: ${e.lead.name}</h5>
                                                <small>Status: ${e.lead.status}</small>
                                            </div>
                                            <span class="badge badge-primary">Lead</span>
                                        </div>
                                    </a>
                                `:""}
                                ${e.opportunity?`
                                    <a href="#Opportunity/view/${e.opportunity.id}" class="list-group-item list-group-item-action">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h5 class="mb-1">Opportunity: ${e.opportunity.name}</h5>
                                                <small>Stage: ${e.opportunity.stage}</small>
                                            </div>
                                            <span class="badge badge-success">Opportunity</span>
                                        </div>
                                    </a>
                                `:""}
                            </div>
                            <div class="mt-3">
                                <button type="button" class="btn btn-secondary btn-block" id="createNewLead">
                                    Create New Lead Instead
                                </button>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>`;const a=$(t).appendTo("body");a.find('[data-toggle="tooltip"]').tooltip(),a.find(".copy-phone").on("click",function(){a.find('input[type="text"]').select(),document.execCommand("copy");const e=$(this),t=e.attr("data-original-title");e.tooltip("hide").attr("data-original-title","Copied!").tooltip("show"),setTimeout(()=>{e.attr("data-original-title",t)},1500)}),a.modal("show"),$("#createNewLead").on("click",function(){a.modal("hide"),r()}),a.on("hidden.bs.modal",function(){a.remove()})})({lead:n.list[0],opportunity:i.list[0]},s):0<n.list.length?window.location.hash="#Lead/view/"+n.list[0].id:0<i.list.length?window.location.hash="#Opportunity/view/"+i.list[0].id:(r(),r(e))}catch(e){console.error("BitvoiceCC Error:",e);l=new URLSearchParams({phoneNumber:a,contactId:contactId||""});window.location.hash="#Opportunity/create?"+l.toString()}}else console.error("BitvoiceCC: Invalid phone number")}else console.error("BitvoiceCC: Missing required phoneNumber")}else console.error("BitvoiceCC: Espo not initialized")}function formatPhoneNumber(e){return e?(e=e.replace(/\D/g,"")).length<10?(console.error("BitvoiceCC: Invalid phone number length"),null):e.startsWith("00")?"+"+e.slice(2):10===e.length||11===e.length&&e.startsWith("0")?"+91"+(e.startsWith("0")?e.slice(1):e):10<e.length?e.startsWith("+")?e:"+"+e:null:(console.error("BitvoiceCC: Missing required phoneNumber"),null)}function encodePhoneNumberForApi(e){e=formatPhoneNumber(e);if(e)return encodeURIComponent(e);throw new Error("Invalid phone number format")}window.BitvoiceCCF={activeCalls:new Map,EVENT_TYPES:{INBOUND_CALL:"INBOUND_CALL",OUTBOUND_CALL:"OUTBOUND_CALL",HANGUP:"HANGUP",AGENT_LOGIN:"AGENT_LOGIN",MISSEDCALL:"MISSEDCALL"},async handleEvent(e){var t=e.Event;if(Object.values(this.EVENT_TYPES).includes(t))try{switch(t){case this.EVENT_TYPES.INBOUND_CALL:await this.handleInboundCall(e);break;case this.EVENT_TYPES.OUTBOUND_CALL:await this.handleOutboundCall(e);break;case this.EVENT_TYPES.HANGUP:await this.handleHangup(e);break;case this.EVENT_TYPES.AGENT_LOGIN:await this.handleAgentLogin(e);break;case this.EVENT_TYPES.MISSEDCALL:await this.handleMissedCall(e)}}catch(e){console.error("Error handling event:",e)}else console.log("Unhandled event type: "+t)},async handleOutboundCall(e){var t=e.Data,a=t.uniqueid;this.activeCalls.set(a,{startTime:new Date,data:t}),await processIncomingEvent(e)},async handleInboundCall(e){var t=e.Data,a=t.uniqueid;this.activeCalls.set(a,{startTime:new Date,data:t}),await processIncomingEvent(e)},async handleHangup(e){console.log("Hangup event:",e.Data),console.log("Active calls:",this.activeCalls);var e=e.Data,t=e.uniqueid;if(this.activeCalls.has(t)){var a=this.activeCalls.get(t),a=new Date-a.startTime;e.duration=a;try{await this.createCallEntity(e)}catch(e){console.error("Error in handleHangup while creating call entity:",e)}this.activeCalls.delete(t)}},async handleAgentLogin(e){},async handleMissedCall(e){},async getParentEntity(){var e=window.location.hash.match(/#([^/]+)\/view\/([^/]+)/);return e?{entityType:e[1],entityId:e[2]}:null},async createCallEntity(e){if(!window.Espo||!window.Espo.Ajax)throw new Error("BitvoiceCC: Espo not initialized");let t=null;try{var a=await window.Espo.Ajax.getRequest("App/user");t=a.user}catch(e){console.warn("Could not fetch current user data:",e)}var a=await this.getParentEntity(),o=new Date(e.eventtime),n=new Date(o.getTime()+e.duration),i=e=>e.getFullYear()+"-"+String(e.getMonth()+1).padStart(2,"0")+"-"+String(e.getDate()).padStart(2,"0")+" "+String(e.getHours()).padStart(2,"0")+":"+String(e.getMinutes()).padStart(2,"0")+":"+String(e.getSeconds()).padStart(2,"0"),l=Math.round(e.duration/1e3);let s=0;s=l<60&&0<l?1:Math.round(l/60);l={name:"Call with "+(e.cid_name||e.cid_num),status:"Held",direction:"INBOUND_CALL"===e.calldirection?"Inbound":"Outbound",dateStart:i(o),dateEnd:i(n),duration:s,description:`Call ${e.calldirection}
From: ${e.from}
To: ${e.to}
Agent: `+e.agent,phoneNumber:e.from,callId:e.uniqueid};a&&(l.parentType=a.entityType,l.parentId=a.entityId),t&&(l.assignedUserId=t.id,t.teamsIds&&0<t.teamsIds.length&&(l.teamsIds=t.teamsIds),t.defaultTeamId)&&(l.defaultTeamId=t.defaultTeamId);try{var r=await window.Espo.Ajax.getRequest("Contact?maxSize=1&where[0][attribute]=phoneNumber&where[0][type]=equals&where[0][value]="+encodePhoneNumberForApi(e.from)),d=(0<r.list.length&&(l.contactId=r.list[0].id,l.contactName=r.list[0].name),await window.Espo.Ajax.postRequest("Call",l));return console.log("Call entity created:",d),d}catch(e){throw console.error("Error creating call entity:",e),e}}},window.BitvoiceCC=function(e){window.BitvoiceCCF.handleEvent(e)},window.BitvoiceCCAPI=window.BitvoiceCC;
