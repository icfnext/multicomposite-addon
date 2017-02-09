<%@include file="/libs/granite/ui/global.jsp" %>
<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@taglib prefix="multicomposite" uri="http://www.icfolson.com/taglibs/multicomposite" %>
<%@page import="com.icfolson.aem.multicompositeaddon.Multicomposite" %>
<c:set var="cmp" value="<%= cmp %>"/>
<c:set var="multi" value="<%=new Multicomposite(cmp,i18n,slingRequest)%>"/>

<div ${multi.readOnlyAttributes }>
	<c:if test="${not empty multi.fieldLabel }">
		<label class="coral-Form-fieldlabel">${multi.fieldLabel}</label>
	</c:if>
	<ol class="coral-Form-field coral-List coral-List--minimal">
		<c:forEach var="value" items="${multi.values}" varStatus="valueStatus">
			<li class="coral-List-item">
				<section  class='coral-Form-fieldset'>
					<div>
						<c:forEach var="field" items="${multi.fields}">
							<div>
								<multicomposite:widgetInclude valueMap="${value}" path="${field.path}" readOnly="true"/>
							</div>
						</c:forEach>
					</div>
				</section>
			</li>
		</c:forEach>
	</ol>
</div>
