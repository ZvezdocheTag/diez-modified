//
//  LoadingViewController.swift
//  PoodleSurf
//
//  Created by Westin Newell on 4/9/19.
//  Copyright © 2019 Haiku. All rights reserved.
//

import UIKit
import DiezPoodleSurf
import Lottie

class LoadingViewController: UIViewController {
    private lazy var diez = Diez<DesignLanguage>(view: view)

    init() {
        super.init(nibName: nil, bundle: nil)
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        diez.attach { [weak self] result in
            switch result {
            case .success(let design):
                self?.apply(design)
            case .failure(let error):
                print(error)
            }
        }
    }

    private func apply(_ system: DesignLanguage){
        apply(system.designs.loading, to: loadingView)
    }

    private var loadingView: LoadingView {
        return view as! LoadingView
    }

    override func loadView() {
        view = LoadingView(frame: UIScreen.main.bounds)
    }

    @available(*, unavailable)
    override init(nibName nibNameOrNil: String?, bundle nibBundleOrNil: Bundle?) { fatalError("\(#function) not implemented.") }

    @available(*, unavailable)
    required init?(coder aDecoder: NSCoder) { fatalError("\(#function) not implemented.") }
}
