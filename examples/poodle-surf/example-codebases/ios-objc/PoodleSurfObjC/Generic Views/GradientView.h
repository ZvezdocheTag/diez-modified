//
//  GradientView.h
//  PoodleSurfObjC
//
//  Created by Westin Newell on 5/10/19.
//  Copyright © 2019 Haiku. All rights reserved.
//

@import UIKit;
@import DiezPoodleSurf;

NS_ASSUME_NONNULL_BEGIN

@interface GradientView : UIView

@property (nonatomic, readonly) CAGradientLayer *gradientLayer;

- (instancetype)initWithCoder:(NSCoder *)aDecoder __attribute__((unavailable("This class does not support NSCoding.")));

@end

NS_ASSUME_NONNULL_END
