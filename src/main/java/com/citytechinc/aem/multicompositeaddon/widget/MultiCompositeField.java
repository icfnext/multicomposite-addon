package com.citytechinc.aem.multicompositeaddon.widget;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.CLASS)
@Target({ ElementType.METHOD, ElementType.FIELD })
public @interface MultiCompositeField {

	boolean matchBaseName() default false;

	@Deprecated
	String prefix() default "./";

	boolean allowReorder() default true;

	String baseName() default "item_";

}